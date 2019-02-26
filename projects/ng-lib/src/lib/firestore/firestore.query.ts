import { QueryEntity } from '@datorama/akita';
import { BaseEntity } from '../akita/types';
import { FirestoreState } from './firestore.store';

export class FirestoreQuery<S extends FirestoreState<E>, E extends BaseEntity> extends QueryEntity<S, E> {}
