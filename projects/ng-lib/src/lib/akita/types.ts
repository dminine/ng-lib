import { HotObservable, ColdObservable } from '../types';

export interface DnlBaseEntity {
  id: string;
}

export type DnlFilterComparison = '>' | '>=' | '==' | '<=' | '<' | '!=' | 'array-contains' | 'text';

export interface DnlQuery<E = any> {
  filters?: DnlFilter<E>[];
  sorts?: DnlSort<E>[];
  page?: number;
  perPage?: number;
}

export interface DnlSort<E = any> {
  field: DnlField<E>;
  direction: 'asc' | 'desc';
  nullOrder?: 'asc' | 'desc';
}

export interface DnlFilter<E = any> {
  field: DnlField<E>;
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

export type DnlField<E> = (keyof E & string) | '__parents__';
