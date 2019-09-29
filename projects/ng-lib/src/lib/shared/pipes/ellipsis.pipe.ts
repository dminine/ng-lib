import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis'
})
export class DnlEllipsisPipe implements PipeTransform {

  transform(value: string, length = 20): any {
    if (typeof value === 'string') {
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
