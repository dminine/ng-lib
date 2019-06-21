import { Component } from '@angular/core';
import { TableAllBaseComponent } from 'ng-lib';

@Component({
  selector: 'app-table-all',
  templateUrl: './table-all.component.html',
  styleUrls: ['./table-all.component.scss']
})
export class TableAllComponent extends TableAllBaseComponent<any> {

  constructor() {
    super([]);
  }

}
