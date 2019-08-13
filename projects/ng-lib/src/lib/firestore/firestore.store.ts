import { EntityStore, EntityState } from '@datorama/akita';
import { DnlFirestoreEntity } from './types';

export interface DnlFirestoreState<E extends DnlFirestoreEntity> extends EntityState<E, string> {}
export class DnlFirestoreStore<
  S extends DnlFirestoreState<E>,
  E extends DnlFirestoreEntity
> extends EntityStore<S, E, string> {}
