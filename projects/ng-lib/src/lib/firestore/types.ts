import { firestore } from 'firebase/app';
import { Subject } from 'rxjs';
import { BaseEntity } from '../akita';

export interface DnlFirestoreEntity extends BaseEntity {
  createdAt: firestore.Timestamp;
  modifiedAt: firestore.Timestamp;
}

export interface CachedQuery {
  total?: number;
  subject?: Subject<boolean>;
  status?: 'loading' | 'loaded';
  lastDoc?: firestore.QueryDocumentSnapshot;
  delayedTasks?: Subject<void>[];
  hasMore?: boolean;
}

export interface CachedId {
  status: 'loading' | 'loaded';
  subject: Subject<void>;
}
