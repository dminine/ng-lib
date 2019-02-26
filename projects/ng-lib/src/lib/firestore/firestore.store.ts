import { EntityStore, EntityState } from '@datorama/akita';
import { BaseEntity } from '../akita/types';

export interface FirestoreState<E extends BaseEntity> extends EntityState<E> {}
export class FirestoreStore<S extends FirestoreState<E>, E extends BaseEntity> extends EntityStore<S, E> {}
