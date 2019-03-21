import { Pipe, PipeTransform } from '@angular/core';
import { isString } from 'util';

@Pipe({
  name: 'ellipsis'
})
export class DnlEllipsisPipe implements PipeTransform {

  transform(value: string, length = 20): any {
    if (isString(value)) {
      if (value.length > length) {
        return value.slice(0, length) + '...';
      } else {
        return value;
      }
    } else {
      return null;
    }
  }

}
