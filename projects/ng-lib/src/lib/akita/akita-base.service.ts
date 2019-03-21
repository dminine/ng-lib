import { QueryEntity, EntityStore, SelectOptions } from '@datorama/akita';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap, tap, filter, publish } from 'rxjs/operators';
import { HotObservable, ColdObservable } from '../types';
import { DnlBaseEntity, DnlAkitaOptions, DnlQuery, DnlInfinityList } from './types';
import { convertStringComparisonToCond, getNestedFieldValue } from './utils';


export abstract class DnlAkitaBaseService<S, E extends DnlBaseEntity> {
  protected defaultPerPage = 20;

  protected constructor(protected store: EntityStore<S, E>, protected query: QueryEntity<S, E>) {}

  get(id: string, options?: DnlAkitaOptions): ColdObservable<E> {
    return this.getManyFromBackend([id], options).pipe(
      switchMap(() => this.query.selectEntity(id))
    );
  }

  getMany(ids: string[], options?: DnlAkitaOptions): ColdObservable<E[]> {
    return this.getManyFromBackend(ids, options).pipe(switchMap(() => this.query.selectMany(ids)));
  }

  list(query?: DnlQuery, options?: DnlAkitaOptions): ColdObservable<E[]> {
    return this.listFromBackend(query, options).pipe(
      switchMap(() => this.query.selectAll(convertQueryForAkita(query))),
      map(this.sliceEntity(query).bind(this))
    );
  }

  infinityList(query?: DnlQuery, options?: DnlAkitaOptions): DnlInfinityList<E> {
    query = query || {};
    let page = query.page || 1;
    const perPage = query.perPage || this.defaultPerPage;

    const perPage$ = new BehaviorSubject(page * perPage);
    const hasMore$ = new BehaviorSubject(false);

    let moreProcessing = false;
    return {
      valueChanges: combineLatest(
        this.listFromBackend({ ...query, page: 1, perPage: page * perPage }, options).pipe(
          tap(hasMore => hasMore$.next(hasMore)),
          switchMap(() => this.query.selectAll(convertQueryForAkita(query)))
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

  selectActive(): ColdObservable<E> {
    return this.query.selectActive() as Observable<E>;
  }

  setActive(id: string): void {
    this.store.setActive(id as any);
  }

  count?(query?: DnlQuery, options?: DnlAkitaOptions): ColdObservable<number>;
  abstract add(entity: Partial<E>, options?: DnlAkitaOptions): HotObservable<E>;
  abstract update(id: string, update: Partial<E>, options?: DnlAkitaOptions): Promise<void>;
  abstract upsert(id: string, entity: Partial<E>, options?: DnlAkitaOptions): HotObservable<E>;
  abstract delete(id: string, options?: DnlAkitaOptions): Promise<void>;

  protected abstract getManyFromBackend(ids: string[], options?: DnlAkitaOptions): HotObservable<void>;
  protected abstract listFromBackend(query?: DnlQuery, options?: DnlAkitaOptions): HotObservable<boolean>;

  protected sliceEntity(query: DnlQuery = {}) {
    return (e: E[]) => {
      if (query.page || query.perPage) {
        const page = query.page || 1;
        const perPage = query.perPage || this.defaultPerPage;
        return e.slice((page - 1) * perPage, page * perPage);
      }

      return e;
    };
  }
}


export function convertQueryForAkita<E extends DnlBaseEntity>(query: DnlQuery) {
  const q: SelectOptions<E> = {};

  if (!query) {
    return;
  }

  if (Array.isArray(query.filters)) {
    q.filterBy = (e: E) => {
      const stack = [];

      for (let i = 0; i < query.filters.length; i++) {
        const f = query.filters[i];

        if (i === 0 || !f.logical || f.logical === 'and') {
          stack.push(
            convertStringComparisonToCond(getNestedFieldValue(e, f.field), f.comparison, f.value)
          );
        } else {
          stack.push(
            stack.pop() ||
            convertStringComparisonToCond(getNestedFieldValue(e, f.field), f.comparison, f.value)
          );
        }
      }

      return stack.indexOf(false) === -1;
    };
  }

  if (Array.isArray(query.sorts)) {
    q.sortBy = (a: E, b: E) => {
      for (const sort of query.sorts) {
        const order = sort.direction === 'asc' ? 1 : -1;

        const av = getNestedFieldValue(a, sort.field);
        const bv = getNestedFieldValue(b, sort.field);
        if (av < bv) {
          return -1 * order;
        } else if (av > bv) {
          return order;
        }
      }
      return 0;
    };
  }

  return q;
}
