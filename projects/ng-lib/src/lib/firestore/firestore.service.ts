import { AngularFirestore, Action, DocumentSnapshot, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { applyTransaction } from '@datorama/akita';
import { firestore } from 'firebase/app';
import { from, Subject, of, forkJoin, combineLatest, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, map, tap, filter, take, first, delayWhen } from 'rxjs/operators';
import { DnlAkitaBaseService, convertQueryForAkita, DnlQuery, DnlInfinityList } from '../akita';
import { makeHot } from '../core';
import { HotObservable, ColdObservable, HashMap } from '../types';
import { DnlFirestoreQuery } from './firestore.query';
import { DnlFirestoreState, DnlFirestoreStore } from './firestore.store';
import { CachedQuery, CachedId, DnlFirestoreEntity, DnlFirestoreCount, DnlFirestoreOptions } from './types';
import {
  convertQueryForFirestore,
  isNotCached,
  calcLimit,
  isCachedAll,
  pushParentsFiltering, convertQueryToString
} from './utils';

export class DnlFirestoreService<
  S extends DnlFirestoreState<E>,
  E extends DnlFirestoreEntity
> extends DnlAkitaBaseService<S, E> {
  protected readonly cachedQuery: HashMap<CachedQuery>;
  protected readonly cachedIdMap: HashMap<CachedId>;
  protected createdAtField: string;

  private readonly getRecentDataSubscription: HashMap<Subscription>;

  constructor(
    protected store: DnlFirestoreStore<S, E>,
    protected query: DnlFirestoreQuery<S, E>,
    protected afs: AngularFirestore,
    protected name: string,
    protected parentNames: string[] = []
  ) {
    super(store, query);

    this.cachedQuery = {};
    this.cachedIdMap = {};
    this.getRecentDataSubscription = {};
  }

  enableGetRecentData(parentIds: string[] = []): void {
    this.disableGetRecentData(parentIds);
    this.getRecentData({ parents: parentIds });
  }

  disableGetRecentData(parentIds: string[] = []): void {
    const parentIdsStr = parentIds.toString();
    if (
      this.getRecentDataSubscription[parentIdsStr]
      && !this.getRecentDataSubscription[parentIdsStr].closed
    ) {
      this.getRecentDataSubscription[parentIdsStr].unsubscribe();
    }
  }

  get(id: string, options: DnlFirestoreOptions = {}): ColdObservable<E> {
    const path = this.makePathWithId(id, options.parents);

    return this.getManyFromBackend([path], options).pipe(
      switchMap(() => this.query.selectEntity(path)),
      map(entity => ({ ...entity, id }))
    );
  }

  getMany(ids: string[], options: DnlFirestoreOptions = {}): ColdObservable<E[]> {
    const paths = ids.map(id => this.makePathWithId(id, options.parents));

    return this.getManyFromBackend(paths, options).pipe(
      switchMap(() => this.query.selectMany(paths)),
      map(this.recoverIdFromEntities.bind(this))
    );
  }

  list(query?: DnlQuery, options: DnlFirestoreOptions = {}): ColdObservable<E[]> {
    if (this.checkQueryIsLoading(query, options)) {
      return this.delayTask(query, options);
    }

    return this.listFromBackend(query, options).pipe(
      switchMap(() =>
        this.query.selectAll(convertQueryForAkita(pushParentsFiltering(query, options)))
      ),
      map(this.sliceEntity(query).bind(this)),
      map(this.recoverIdFromEntities.bind(this))
    );
  }

  infinityList(query: DnlQuery = {}, options: DnlFirestoreOptions = {}): DnlInfinityList<E> {
    let page = query.page || 1;
    const perPage = query.perPage || this.defaultPerPage;

    const perPage$ = new BehaviorSubject(page * perPage);
    const hasMore$ = new BehaviorSubject(false);

    let moreProcessing = false;

    return {
      valueChanges: combineLatest([
        this.listFromBackend({ ...query, page: 1, perPage: page * perPage }, options).pipe(
          tap(hasMore => hasMore$.next(hasMore)),
          switchMap(() =>
            this.query.selectAll(convertQueryForAkita(pushParentsFiltering(query, options)))
          ),
          map(this.recoverIdFromEntities.bind(this))
        ),
        perPage$.asObservable()
      ]).pipe(
        filter(() => !moreProcessing),
        map(([e, pp]: [E[], number]) => e.slice(0, pp))
      ),

      more: () => {
        moreProcessing = true;
        page += 1;
        return makeHot<boolean>(
          this.listFromBackend({ ...query, page, perPage }, options).pipe(
            tap(hasMore => hasMore$.next(hasMore)),
            tap(() => (moreProcessing = false)),
            tap(() => perPage$.next(page * perPage))
          )
        );
      },

      hasMore$: hasMore$.asObservable()
    };
  }

  count(query?: DnlQuery, options: DnlFirestoreOptions = {}): ColdObservable<number> {
    let path = 'counts/';

    if (this.parentNames) {
      path += this.makePath(options.parents);
    } else {
      path += this.name;
    }

    return this.afs.doc<DnlFirestoreCount>(path).valueChanges().pipe(
      map(count => (count && count.total) || 0)
    );
  }

  add(entity: Partial<E>, options: DnlFirestoreOptions = {}): HotObservable<E> {
    const path = this.makePath(options.parents);
    const id = this.afs.createId();

    return makeHot<E>(
      from(this.addWithCount(entity, path, `${path}/${id}`)).pipe(
        switchMap(() => this.get(id, options))
      )
    );
  }

  update(id: string, update: Partial<E>, options: DnlFirestoreOptions = {}): Promise<void> {
    return this.afs.doc(this.makePathWithId(id, options.parents)).update({
      ...update,
      modifiedAt: firestore.Timestamp.now()
    });
  }

  upsert(id: string, entity: Partial<E>, options: DnlFirestoreOptions = {}): HotObservable<E> {
    const path = this.makePath(options.parents);
    const pathWithId = `${path}/${id}`;

    return makeHot<E>(
      this.afs.doc(pathWithId).snapshotChanges().pipe(
        take(1),
        switchMap(snap =>
          snap.payload.exists ?
            this.update(id, entity, options) :
            this.addWithCount(entity, path, pathWithId)
        ),
        switchMap(() => this.get(id, options))
      )
    );
  }

  delete(id: string, options: DnlFirestoreOptions = {}): Promise<void> {
    const path = this.makePath(options.parents);
    const pathWithId = `${path}/${id}`;

    return runTransaction(async transaction => {
      await Promise.all([
        transaction.delete(this.afs.doc(pathWithId).ref),
        transaction.set(
          this.afs.doc(`counts/${path}`).ref,
          {
            total: firestore.FieldValue.increment(-1)
          },
          { merge: true }
        )
      ]);
    });
  }

  increase(id: string, field: keyof E, increase = 1): Promise<void> {
    return this.update(id, { [field]: firestore.FieldValue.increment(increase) } as any);
  }

  decrease(id: string, field: keyof E, decrease = 1): Promise<void> {
    return this.increase(id, field, decrease * -1);
  }

  protected getManyFromBackend(paths: string[], options: DnlFirestoreOptions = {}): HotObservable<void> {
    if (isCachedAll(paths, this.cachedIdMap)) {
      return of(undefined);
    }

    const subject = new Subject<void>();
    let count = 0;
    const snaps: Action<DocumentSnapshot<E>>[] = [];

    const filteredPaths = paths.filter(path => !(path in this.cachedIdMap));

    for (const path of filteredPaths) {
      this.cachedIdMap[path] = {
        status: 'loading',
        subject: new Subject<void>()
      };

      this.afs.doc<E>(path).snapshotChanges().subscribe(snap => {
        count++;

        count <= filteredPaths.length ?
          snaps.push(snap) :
          this.distributeSnapshot(snap.payload);

        if (count === filteredPaths.length) {
          applyTransaction(() => {
            snaps.forEach(s => {
              this.distributeSnapshot(s.payload);
              const key = s.payload.ref.path;
              this.cachedIdMap[key].status = 'loaded';
              this.cachedIdMap[key].subject.next();
              this.cachedIdMap[key].subject.complete();
            });
          });
        }
      });
    }

    forkJoin(this.filterLoadingObservable(paths)).subscribe(() => {
      setTimeout(() => {
        subject.next();
        subject.complete();
      });
    });

    return subject.asObservable();
  }

  protected listFromBackend(query: DnlQuery = {}, options: DnlFirestoreOptions = {}): HotObservable<boolean> {
    if (Boolean(options.ignoreCache)) {
      return this.ignoreCacheListFromBackend(query, options);
    } else {
      return this.cacheListFromBackend(query, options);
    }
  }

  protected distributeSnapshot(snap: QueryDocumentSnapshot<E>): void {
    const data = snap.data();
    const path = snap.ref.path;

    if (snap.exists) {
      const entity: any = { ...data, id: path };

      const splitPath = path.split('/');

      if (splitPath.length > 2) {
        const parents = [];

        for (let i = 1; i < splitPath.length - 1; i += 2) {
          parents.push(splitPath[i]);
        }

        entity.__parents__ = parents.toString();
      }

      this.store.upsert(path, entity);

    } else {
      this.store.remove(path);
    }
  }

  protected makePath(parentIds: string[] = []): string {
    const namesLength = this.parentNames.length;

    if (!namesLength) {
      return this.name;
    }

    if (namesLength !== parentIds.length) {
      throw new Error('Parent collection 이름과 id의 갯수가 맞지 않습니다.');
    }

    let path = '';
    for (let i = 0; i < namesLength; i++) {
      if (i !== 0) {
        path += '/';
      }

      path += `${this.parentNames[i]}/${parentIds[i]}`;
    }

    return `${path}/${this.name}`;
  }

  protected makePathWithId(id: string, parentIds: string[] = []): string {
    return `${this.makePath(parentIds)}/${id}`;
  }

  private getRecentData(options: DnlFirestoreOptions = {}): void {
    if (!this.createdAtField) {
      throw new Error('createdAtField 변수를 먼저 설정해야 합니다');
    }

    const queryFn = query => query.where(this.createdAtField, '>=', firestore.Timestamp.now());

    const collectionRef = options.group ?
      this.afs.collectionGroup(this.name, queryFn) :
      this.afs.collection(this.makePath(options.parents), queryFn);

    this.getRecentDataSubscription[options.parents.toString()] = collectionRef.snapshotChanges().pipe(
      first(snaps => snaps.length > 0),
    ).subscribe(snaps => {
      this.getManyFromBackend(snaps.map(snap => snap.payload.doc.ref.path), options);
      this.getRecentData(options);
    });
  }

  private checkQueryIsLoading(query: DnlQuery, options: DnlFirestoreOptions): boolean {
    if (Boolean(options.ignoreCache)) {
      return false;
    }

    const queryStr = convertQueryToString(query, options);

    return this.cachedQuery[queryStr] && this.cachedQuery[queryStr].status === 'loading';
  }

  private delayTask(query: DnlQuery, options: DnlFirestoreOptions): HotObservable<E[]> {
    const queryStr = convertQueryToString(query, options);

    const subject = new Subject<void>();
    this.cachedQuery[queryStr].delayedTasks.push(subject);
    return subject.asObservable().pipe(switchMap(() => this.list(query, options)));
  }

  private ignoreCacheListFromBackend(query: DnlQuery, options: DnlFirestoreOptions): HotObservable<boolean> {
    const subject = new Subject<boolean>();

    const queryFn = query && convertQueryForFirestore(query);

    const collectionRef = options.group ?
      this.afs.collectionGroup(this.name, queryFn) :
      this.afs.collection(this.makePath(options.parents), queryFn);

    collectionRef.get().pipe(
      delayWhen(snaps =>
        this.getManyFromBackend(snaps.docs.map(snap => snap.ref.path), options))
    ).subscribe(snaps => {
      subject.next(calcLimit(query) === snaps.docs.length);
      subject.complete();
    });

    return subject.asObservable();
  }

  private cacheListFromBackend(query: DnlQuery, options: DnlFirestoreOptions): HotObservable<boolean> {
    const queryStr = convertQueryToString(query, options);

    if (isNotCached(this.cachedQuery[queryStr], query)) {
      if (!this.cachedQuery[queryStr]) {
        this.cachedQuery[queryStr] = {
          delayedTasks: []
        };
      }

      this.cachedQuery[queryStr].subject = new Subject<boolean>();
      this.cachedQuery[queryStr].status = 'loading';

      const queryFn = query && convertQueryForFirestore(query, this.cachedQuery[queryStr]);

      const collectionRef = options.group ?
        this.afs.collectionGroup(this.name, queryFn) :
        this.afs.collection(this.makePath(options.parents), queryFn);

      collectionRef.get().pipe(
        delayWhen(snaps =>
          this.getManyFromBackend(snaps.docs.map(snap => snap.ref.path), options))
      ).subscribe(snaps => {
        const snapsLength = snaps.docs.length;

        const total = this.cachedQuery[queryStr].total ?
          this.cachedQuery[queryStr].total + snapsLength :
          snapsLength;

        const hasMore = calcLimit(query, this.cachedQuery[queryStr]) === snapsLength;

        this.cachedQuery[queryStr] = {
          ...this.cachedQuery[queryStr],
          total,
          status: 'loaded',
          lastDoc: snaps.docs[snapsLength - 1],
          hasMore
        };

        this.cachedQuery[queryStr].subject.next(hasMore);
        this.cachedQuery[queryStr].subject.complete();

        if (this.cachedQuery[queryStr].delayedTasks.length) {
          const delayedTask = this.cachedQuery[queryStr].delayedTasks.shift();
          delayedTask.next();
          delayedTask.complete();
        }
      });

    } else if (this.cachedQuery[queryStr].status === 'loaded') {
      return of(this.cachedQuery[queryStr].hasMore);
    }

    return this.cachedQuery[queryStr].subject.asObservable();
  }

  private filterLoadingObservable(paths: string[]): ColdObservable<void>[] {
    return paths
      .filter(path => this.cachedIdMap[path].status === 'loading')
      .map(path => this.cachedIdMap[path].subject.asObservable());
  }

  private addWithCount(entity: Partial<E>, path: string, pathWithId: string): Promise<void> {
    return runTransaction(async transaction => {
      await Promise.all([
        transaction.set(
          this.afs.doc(pathWithId).ref,
          {
            ...entity,
            createdAt: firestore.Timestamp.now(),
            modifiedAt: firestore.Timestamp.now()
          }
        ),
        transaction.set(
          this.afs.doc(`counts/${path}`).ref,
          {
            total: firestore.FieldValue.increment(1)
          },
          { merge: true }
        )
      ]);
    });
  }

  private recoverIdFromPath(path: string): string {
    return path.split('/').pop();
  }

  private recoverIdFromEntities(entities: E[]): E[] {
    return entities.map(entity => ({ ...entity, id: this.recoverIdFromPath(entity.id) }));
  }
}

export function runTransaction<T>(
  updateFunction: (transaction: firestore.Transaction) => Promise<T>
): Promise<T> {
  return firestore().runTransaction<T>(updateFunction);
}
