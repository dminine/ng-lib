import { AngularFirestore } from '@angular/fire/firestore';
import { applyTransaction } from '@datorama/akita';
import { firestore } from 'firebase/app';
import { from, Subject, of, forkJoin, combineLatest, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, publish, map, tap, filter, take, skipWhile } from 'rxjs/operators';
import { DnlAkitaBaseService, convertQueryForAkita } from '../akita';
import { HotObservable, ColdObservable, HashMap } from '../types';
import {
  DnlQuery,
  DnlAkitaOptions,
  DnlInfinityList
} from '../akita/types';
import { DnlFirestoreQuery } from './firestore.query';
import { DnlFirestoreState, DnlFirestoreStore } from './firestore.store';
import { CachedQuery, CachedId, DnlFirestoreEntity } from './types';
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
  protected readonly cachedId: HashMap<CachedId>;
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
    this.cachedId = {};
    this.getRecentDataSubscription = {};
  }

  enableGetRecentData(parentIds: string[] = []): void {
    this.disableGetRecentData(parentIds);
    this.getRecentData(parentIds);
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

  list(query?: DnlQuery, options: DnlAkitaOptions = {}): ColdObservable<E[]> {
    if (this.checkQueryIsLoading(query, options)) {
      return this.delayTask(query, options);
    }

    if (!this.isSubCollection) {
      return super.list(query, options);
    }

    return this.listFromBackend(query, options).pipe(
      switchMap(() =>
        this.query.selectAll(convertQueryForAkita(pushParentsFiltering(query, options)))
      ),
      map(this.sliceEntity(query).bind(this))
    );
  }

  infinityList(query: DnlQuery = {}, options: DnlAkitaOptions = {}): DnlInfinityList<E> {
    if (!this.isSubCollection) {
      return super.infinityList(query, options);
    }

    let page = query.page || 1;
    const perPage = query.perPage || this.defaultPerPage;

    const perPage$ = new BehaviorSubject(page * perPage);
    const hasMore$ = new BehaviorSubject(false);

    let moreProcessing = false;
    return {
      valueChanges: combineLatest(
        this.listFromBackend({ ...query, page: 1, perPage: page * perPage }, options).pipe(
          tap(hasMore => hasMore$.next(hasMore)),
          switchMap(() =>
            this.query.selectAll(convertQueryForAkita(pushParentsFiltering(query, options)))
          )
        ),
        perPage$.asObservable()
      ).pipe(
        filter(() => !moreProcessing),
        map(([e, pp]: [E[], number]) => e.slice(0, pp))
      ),

      more: () => {
        moreProcessing = true;
        page += 1;
        const observable = publish<boolean>()(
          this.listFromBackend({ ...query, page, perPage }, options).pipe(
            tap(hasMore => hasMore$.next(hasMore)),
            tap(() => (moreProcessing = false)),
            tap(() => perPage$.next(page * perPage))
          )
        );

        observable.connect();

        return observable;
      },

      hasMore$: hasMore$.asObservable()
    };
  }

  add(entity: Partial<E>, options: DnlAkitaOptions = {}): HotObservable<E> {
    const observable = publish<E>()(
      from(
        this.afs.collection(this.makePath(options.parents)).add({
          ...entity,
          createdAt: firestore.Timestamp.now(),
          modifiedAt: firestore.Timestamp.now()
        })
      ).pipe(
        switchMap(doc => this.get(doc.id, options))
      )
    );

    observable.connect();

    return observable;
  }

  update(id: string, update: Partial<E>, options: DnlAkitaOptions = {}): Promise<void> {
    return this.afs.doc(this.makePathWithId(id, options.parents)).update({
      ...update,
      modifiedAt: firestore.Timestamp.now()
    });
  }

  upsert(id: string, entity: Partial<E>, options: DnlAkitaOptions = {}): HotObservable<E> {
    const observable = publish<E>()(
      from(
        this.afs.doc(this.makePathWithId(id, options.parents)).set(
          { ...entity, createdAt: firestore.Timestamp.now(), modifiedAt: firestore.Timestamp.now() },
          { merge: true }
        )
      ).pipe(
        switchMap(() => this.get(id, options))
      )
    );

    observable.connect();

    return observable;
  }

  delete(id: string, options: DnlAkitaOptions = {}): Promise<void> {
    return this.afs.doc(this.makePathWithId(id, options.parents)).delete();
  }

  protected getManyFromBackend(ids: string[], options: DnlAkitaOptions = {}): HotObservable<void> {
    if (isCachedAll(ids, this.cachedId)) {
      return of(undefined);
    }

    const subject = new Subject<void>();
    let count = 0;
    const snaps = [];

    const filteredIds = ids.filter(id => !(id in this.cachedId));

    for (const id of filteredIds) {
      this.cachedId[id] = {
        status: 'loading',
        subject: new Subject<void>()
      };

      this.afs
        .doc<E>(this.makePathWithId(id, options.parents))
        .snapshotChanges()
        .subscribe(snap => {
          count++;

          if (count <= filteredIds.length) {
            snaps.push(snap);
          } else {
            this.distributeSnapshot(snap, options.parents);
          }

          if (count === filteredIds.length) {
            applyTransaction(() => {
              snaps.forEach(s => {
                this.distributeSnapshot(s, options.parents);
                this.cachedId[s.payload.id].status = 'loaded';
                this.cachedId[s.payload.id].subject.next();
                this.cachedId[s.payload.id].subject.complete();
              });
            });
          }
        });
    }

    forkJoin(this.filterLoadingObservable(ids)).subscribe(() => {
      setTimeout(() => {
        subject.next();
        subject.complete();
      });
    });

    return subject.asObservable();
  }

  protected listFromBackend(query: DnlQuery = {}, options: DnlAkitaOptions = {}): HotObservable<boolean> {
    if (Boolean(options.ignoreCache)) {
      return this.ignoreCacheListFromBackend(query, options);
    } else {
      return this.cacheListFromBackend(query, options);
    }
  }

  protected distributeSnapshot(snap, parents: string[] = []): void {
    const id = snap.payload.id;
    const data = snap.payload.data();

    if (snap.payload.exists) {
      const entity = { ...data, id };
      if (parents.length) {
        entity.__parents__ = parents.toString();
      }
      this.store.createOrReplace(id, entity);
    } else {
      this.store.remove(id);
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

  private getRecentData(parentIds: string[]): void {
    if (!this.createdAtField) {
      throw new Error('createdAtField 변수를 먼저 설정해야 합니다');
    }

    this.getRecentDataSubscription[parentIds.toString()] = this.afs.collection(
      this.makePath(parentIds),
      query => query.where(this.createdAtField, '>=', firestore.Timestamp.now())
    ).snapshotChanges().pipe(
      skipWhile(snaps => !snaps.length),
      take(1)
    ).subscribe(snaps => {
      this.getManyFromBackend(
        snaps.map(snap => snap.payload.doc.id),
        { parents: parentIds }
      );
      this.getRecentData(parentIds);
    });
  }

  private get isSubCollection(): boolean {
    return Boolean(this.parentNames.length);
  }

  private checkQueryIsLoading(query: DnlQuery, options: DnlAkitaOptions): boolean {
    if (Boolean(options.ignoreCache)) {
      return false;
    }

    const queryStr = convertQueryToString(query, options);

    return this.cachedQuery[queryStr] && this.cachedQuery[queryStr].status === 'loading';
  }

  private delayTask(query: DnlQuery, options: DnlAkitaOptions): HotObservable<E[]> {
    const queryStr = convertQueryToString(query, options);

    const subject = new Subject<void>();
    this.cachedQuery[queryStr].delayedTasks.push(subject);
    return subject.asObservable().pipe(switchMap(() => this.list(query, options)));
  }

  private ignoreCacheListFromBackend(query: DnlQuery, options: DnlAkitaOptions): HotObservable<boolean> {
    const subject = new Subject<boolean>();

    this.afs
      .collection<E>(this.makePath(options.parents), query && convertQueryForFirestore(query))
      .get()
      .subscribe(snap => {
        this.getManyFromBackend(snap.docs.map(s => s.id), options).subscribe(() => {
          subject.next(calcLimit(query) === snap.docs.length);
          subject.complete();
        });
      });

    return subject.asObservable();
  }

  private cacheListFromBackend(query: DnlQuery, options: DnlAkitaOptions): HotObservable<boolean> {
    const queryStr = convertQueryToString(query, options);

    if (isNotCached(this.cachedQuery[queryStr], query)) {
      if (!this.cachedQuery[queryStr]) {
        this.cachedQuery[queryStr] = {
          delayedTasks: []
        };
      }
      this.cachedQuery[queryStr].subject = new Subject<boolean>();
      this.cachedQuery[queryStr].status = 'loading';

      this.afs
        .collection<E>(
          this.makePath(options.parents),
          query && convertQueryForFirestore(query, this.cachedQuery[queryStr])
        )
        .get()
        .subscribe(snap => {
          this.getManyFromBackend(snap.docs.map(s => s.id), options).subscribe(() => {
            const total = this.cachedQuery[queryStr].total
              ? this.cachedQuery[queryStr].total + snap.docs.length
              : snap.docs.length;
            const hasMore = calcLimit(query, this.cachedQuery[queryStr]) === snap.docs.length;

            this.cachedQuery[queryStr] = {
              ...this.cachedQuery[queryStr],
              total,
              status: 'loaded',
              lastDoc: snap.docs[snap.docs.length - 1],
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
        });
    } else if (this.cachedQuery[queryStr].status === 'loaded') {
      return of(this.cachedQuery[queryStr].hasMore);
    }

    return this.cachedQuery[queryStr].subject.asObservable();
  }

  private filterLoadingObservable(ids: string[]): ColdObservable<void>[] {
    return ids
      .filter(id => this.cachedId[id].status === 'loading')
      .map(id => this.cachedId[id].subject.asObservable());
  }
}