import { Observable } from 'rxjs';

export interface HotObservable<T> extends Observable<T> {}
export interface ColdObservable<T> extends Observable<T> {}
