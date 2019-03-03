import { QueryEntity } from '@datorama/akita';
import { DnlFirestoreState } from './firestore.store';
import { DnlFirestoreEntity } from './types';

export class DnlFirestoreQuery<S extends DnlFirestoreState<E>, E extends DnlFirestoreEntity> extends QueryEntity<S, E> {}
