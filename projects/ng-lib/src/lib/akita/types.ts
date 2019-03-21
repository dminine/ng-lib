import { HotObservable, ColdObservable } from '../types';

export interface DnlBaseEntity {
  id: string;
}

export type DnlFilterComparison = '>' | '>=' | '==' | '<=' | '<' | '!=' | 'array-contains' | 'text';

export interface DnlQuery {
  filters?: DnlFilter[];
  sorts?: DnlSort[];
  page?: number;
  perPage?: number;
}

export interface DnlSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DnlFilter {
  field: string;
  searchField?: string;
  comparison: DnlFilterComparison;
  logical?: 'and' | 'or';
  value: any;
}

export interface DnlAkitaOptions {
  parents?: string[];
  ignoreCache?: boolean;
}

export interface DnlInfinityList<E extends DnlBaseEntity> {
  valueChanges: HotObservable<E[]>;
  more: () => HotObservable<boolean>;
  hasMore$: ColdObservable<boolean>;
}
