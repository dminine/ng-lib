import { HotObservable, ColdObservable } from '../types';

export interface BaseEntity {
  id: string;
}

export type QueryComparison = '>' | '>=' | '==' | '<=' | '<' | '!=' | 'array-contains' | 'text';

export interface Query {
  filters?: QueryFilter[];
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
  page?: number;
  perPage?: number;
}

export interface QueryFilter {
  field: string;
  searchField?: string;
  comparison: QueryComparison;
  logical?: 'and' | 'or';
  value: any;
}

export interface Options {
  parents?: string[];
  ignoreCache?: boolean;
}

export interface InfinityListResponse<E extends BaseEntity> {
  valueChanges: HotObservable<E[]>;
  more: () => HotObservable<boolean>;
  hasMore$: ColdObservable<boolean>;
}
