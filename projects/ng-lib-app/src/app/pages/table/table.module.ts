import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableRoutingModule } from './table-routing.module';
import { TablePageComponent } from './components/table-page/table-page.component';
import { TableAllComponent } from './components/table-all/table-all.component';

@NgModule({
  declarations: [TablePageComponent, TableAllComponent],
  imports: [
    CommonModule,
    TableRoutingModule
  ]
})
export class TablePageModule { }
