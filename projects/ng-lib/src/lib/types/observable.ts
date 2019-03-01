import { Observable } from 'rxjs';

export interface HotObservable<T> extends Observable<T> {}
export interface HotObservableOnce<T> extends Observable<T> {}
export interface ColdObservable<T> extends Observable<T> {}
export interface ColdObservableOnce<T> extends Observable<T> {}
export interface ObservableOnce<T> extends Observable<T> {}
