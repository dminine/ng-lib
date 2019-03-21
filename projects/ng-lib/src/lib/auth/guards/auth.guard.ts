import { Injectable, Inject, Optional } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, skipWhile, take, tap } from 'rxjs/operators';
import { DnlBaseEntity } from '../../akita';
import { DnlAuthQuery } from '../state/auth.query';
import { LOGIN_PATH_TOKEN } from '../tokens';

@Injectable({
  providedIn: 'root'
})
export class DnlAuthGuard<U extends DnlBaseEntity>
  implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    protected authQuery: DnlAuthQuery<U>,
    protected router: Router,
    @Optional()
    @Inject(LOGIN_PATH_TOKEN)
    private loginPath: string
  ) {}

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkLoggedIn((route.data || {}).blockNavigating);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route);
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkLoggedIn((route.data || {}).blockNavigating);
  }

  checkLoggedIn(blockNavigating = false) {
    return this.authQuery.select(state => state).pipe(
      skipWhile(state => !state.isAuthLoaded),
      take(1),
      map(state => state.isLoggedIn),
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          if (!blockNavigating) {
            this.router.navigateByUrl(this.loginPath || '/');
          }
          throw new Error('access denied!');
        }
      })
    );
  }
}
