import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { DnlBaseEntity } from '../../akita';
import { DnlAuthStore, DnlAuthState } from './auth.store';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class DnlAuthQuery<U extends DnlBaseEntity> extends Query<DnlAuthState<U>> {
  isProcessEnded$: Observable<boolean>;
  isEmailVerified$: Observable<boolean>;
  isPhoneVerified$: Observable<boolean>;
  user$: Observable<U>;
  isLoggedIn$: Observable<boolean>;

  protected constructor(protected store: DnlAuthStore<U>) {
    super(store);
    this.isProcessEnded$ = this.select(state => state.isProcessEnded);
    this.isEmailVerified$ = this.select(state => state.isEmailVerified);
    this.isPhoneVerified$ = this.select(state => state.isPhoneVerified);
    this.user$ = this.select(state => state.user);
    this.isLoggedIn$ = this.select(state => state.isLoggedIn);
  }

  get isProcessEnded(): boolean {
    return this.getValue().isProcessEnded;
  }

  get isEmailVerified(): boolean {
    return this.getValue().isEmailVerified;
  }

  get isPhoneVerified(): boolean {
    return this.getValue().isPhoneVerified;
  }

  get user(): U {
    return this.getValue().user;
  }

  get isLoggedIn(): boolean {
    return this.getValue().isLoggedIn;
  }

  abstract get userInfo(): Partial<U>;
}
