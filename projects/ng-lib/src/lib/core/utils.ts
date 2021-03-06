import { fromEvent, Observable } from 'rxjs';
import { take, map, publish } from 'rxjs/operators';
import { DnlBaseEntity } from '../akita';
import { HotObservable, HashMap } from '../types';


export function delayTask(callback: () => void) {
  setTimeout(() => {
    callback();
  });
}

export function delayMicrotask(callback: () => void) {
  Promise.resolve(null).then(() => {
    callback();
  });
}

export function pad(n: number, width = 4, z = '0') {
  const str = n.toString();
  return str.length >= width ? str : new Array(width - str.length + 1).join(z) + str;
}

export function getOffsetTopFromRoot(element: HTMLElement): number {
  if (element.offsetParent) {
    return element.offsetTop + getOffsetTopFromRoot(element.offsetParent as HTMLElement);
  } else {
    return element.offsetTop;
  }
}

function dec2hex(dec: number) {
  return ('0' + dec.toString(16)).substr(-2);
}

export function generateId(len: number) {
  const arr = new Uint8Array((len || 40) / 2);
  const crypto = window.crypto || (window as any).msCrypto;
  crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
}

export function separateObject<T, K extends keyof T>(object: T, properties: K[]): T {
  const partial = {} as T;
  for (const property of properties) {
    partial[property] = object[property];
  }
  return partial;
}

export function separateObjectMultiple<T, K extends keyof T>(object: T, propertiesArray: K[][]): T[] {
  const array = new Array(propertiesArray.length);
  for (let i = 0; i < propertiesArray.length; i++) {
    array[i] = {} as T;
    for (const property of propertiesArray[i]) {
      array[i][property] = object[property];
    }
  }
  return array;
}

export function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function deepEqual<A, B>(obj1: A, obj2: B): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function readAsBinaryString(file: File): Observable<string> {
  const { reader, observable } = readAs(file);

  reader.readAsBinaryString(file);

  return observable;
}

export function readAsDataURL(file: File): Observable<string> {
  const { reader, observable } = readAs(file);

  reader.readAsDataURL(file);

  return observable;
}

function readAs(file: File): { reader: FileReader, observable: Observable<string> } {
  const reader = new FileReader();

  const observable = fromEvent(reader, 'load').pipe(
    take(1),
    map((event: any) => event.target.result)
  );

  return { reader, observable };
}

export function makeHot<T = any>(observable: Observable<T>): HotObservable<T> {
  const o = publish<T>()(observable);
  o.connect();
  return o;
}

export function imageMagnificationReplacer(fileName: string, magnification: number) {
  return fileName.replace(/.([^.]*)$/, `@${magnification}x.$1`);
}

export function convertArrayToHashMapById<T extends DnlBaseEntity>(array: T[]): HashMap<T> {
  return array.reduce((prev, curr) => ({ ...prev, [curr.id]: curr }), {});
}

export function sumProperty<T>(array: T[], property: keyof T): number {
  if (array.length > 0) {
    return array.map(value => value[property]).reduce((prev, curr) => {
      if (typeof +curr === 'number' && !isNaN(+curr)) {
        return prev + +curr;
      }

      return prev;
    }, 0);
  } else {
    return 0;
  }
}

export function convertToInternationalPhoneNumber(phoneNumber: string) {
  return `+82${phoneNumber.split('-').join('').slice(1)}`;
}

function isObject(val) {
  if (val === null) {
    return false;
  }

  return typeof val === 'function' || typeof val === 'object';
}

export function mergeDeep<T, S>(target, source): T & S {
  const output = Object.assign({}, target);

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });

          } else {
            output[key] = mergeDeep(target[key], source[key]);
          }

        } else {
          Object.assign(output, { [key]: source[key] });
        }
      }
    }
  }
  return output;
}
