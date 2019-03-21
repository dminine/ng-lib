import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DnlBaseEntity } from '../../akita';
import { DnlAuthQuery } from './auth.query';
import { DnlAuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export abstract class AuthService<U extends DnlBaseEntity> {
  protected constructor(
    protected authStore: DnlAuthStore<U>,
    protected authQuery: DnlAuthQuery<U>,
    protected router: Router,
    protected mainPath = '/'
  ) {
    this.init();
  }

  abstract signUp(id: string, password: string, userInfo: Partial<U>): Observable<U>;
  abstract login(id: string, password: string): Observable<U>;
  abstract updateUser?(userInfo: Partial<U>): Observable<void>;
  abstract changePassword?(password: string, newPassword: string): Observable<void>;

  abstract verifyEmail?(code: string, id?: string): Observable<void>;
  abstract sendEmailVerificationCode?(email: string): Observable<void>;

  abstract verifyPhone?(code: string, id?: string): Observable<void>;
  abstract sendPhoneVerificationCode?(phoneNumber: string): Observable<void>;

  abstract forgotPassword?(id: string): Observable<void>;
  abstract confirmForgotPassword?(id: string, code: string, password: string): Observable<void>;

  abstract deleteUser?(): Observable<void>;

  setRedirectUrl(url: string): void {
    this.authStore.update({
      redirectUrl: url
    });
  }

  logout(preventNavigation = false) {
    this.authStore.update({
      isLoggedIn: false,
      isAuthLoaded: false,
      isPhoneVerified: false,
      user: null
    });

    if (!preventNavigation) {
      this.router.navigateByUrl(this.mainPath);
    }
  }

  protected abstract init(): void;
}
