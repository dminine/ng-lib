import { QueryFn } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { DnlQuery, DnlAkitaOptions } from '../akita';
import { CachedQuery, DnlFirestoreOptions } from './types';

export function convertQueryToString(query: DnlQuery = {}, options: DnlAkitaOptions = {}): string {
  const copiedQuery = JSON.parse(JSON.stringify({ ...query, ...options }));
  delete copiedQuery.page;
  delete copiedQuery.perPage;
  return JSON.stringify(copiedQuery);
}

export function convertQueryForFirestore(query: DnlQuery, cachedQuery: CachedQuery = {}): QueryFn {
  return (fQuery: firestore.Query) => {
    let q = fQuery;

    if (Array.isArray(query.filters)) {
      for (const f of query.filters) {
        if (f.comparison === '!=' || f.comparison === 'text') {
          throw new Error('Firestore에서는 "!="와 "text"로 filtering 할 수 없습니다.');
        }

        q = q.where(f.field, f.comparison as any, f.value);
      }
    }

    if (Array.isArray(query.sorts)) {
      for (const sort of query.sorts) {
        q = q.orderBy(sort.field, sort.direction);
      }
    }

    if (query.page || query.perPage) {
      const limit = calcLimit(query, cachedQuery);

      if (limit > 0) {
        q = q.limit(limit);
      }

      if (cachedQuery.lastDoc) {
        q = q.startAfter(cachedQuery.lastDoc);
      }
    }

    return q;
  };
}

export function calcLimit(query: DnlQuery = {}, cachedQuery: CachedQuery = {}) {
  const page = query.page || 1;
  const perPage = query.perPage || 20;
  let limit = page * perPage;

  if (cachedQuery.total) {
    limit = limit - cachedQuery.total;
  }

  return limit;
}

export function pushParentsFiltering(query: DnlQuery, options: DnlFirestoreOptions): DnlQuery {
  if (options.group) {
    return query;
  } else {
    return {
      ...query,
      filters: [
        ...(query.filters || []),
        { field: '__parents__', comparison: '==', value: options.parents.toString() }
      ]
    };
  }
}

export function isNotCached(cachedQuery: CachedQuery, query: DnlQuery): boolean {
  return !cachedQuery || (cachedQuery.total < query.page * query.perPage && cachedQuery.hasMore);
}

export function isCachedAll(ids: string[], cachedId: any): boolean {
  return (
    ids.map(id => Boolean(cachedId[id]) && cachedId[id].status === 'loaded').indexOf(false) === -1
  );
}
