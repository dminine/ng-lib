import { Injectable } from '@angular/core';
import { Observable, fromEvent, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DnlScrollService {

  constructor() { }

  get scrollTop$(): Observable<number> {
    return fromEvent(window.document, 'scroll').pipe(
      map((event: any) =>
        window.pageYOffset ||
        event.target.documentElement.scrollTop ||
        event.target.body.scrollTop ||
        0
      )
    );
  }

  get screenHeight$(): Observable<number> {
    return fromEvent(window, 'resize').pipe(
      startWith(window.innerHeight),
      map(() => window.innerHeight)
    );
  }

  get scrollTopAndScreenHeight$(): Observable<[number, number]> {
    return combineLatest(this.scrollTop$, this.screenHeight$);
  }
}
