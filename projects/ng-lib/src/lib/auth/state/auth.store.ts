import { Store } from '@datorama/akita';
import { DnlBaseEntity } from '../../akita';

export interface DnlAuthState<U extends DnlBaseEntity> {
  isAuthLoaded: boolean;
  isProcessEnded?: boolean;
  isLoggedIn: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  user: U;
  redirectUrl?: string;
}

export function createInitialState<U extends DnlBaseEntity>(): DnlAuthState<U> {
  return {
    isAuthLoaded: false,
    isProcessEnded: false,
    isLoggedIn: false,
    isEmailVerified: false,
    isPhoneVerified: false,
    user: null,
    redirectUrl: '/'
  };
}

export abstract class DnlAuthStore<U extends DnlBaseEntity> extends Store<DnlAuthState<U>> {

  protected constructor(
  ) {
    super(createInitialState());
  }

}

