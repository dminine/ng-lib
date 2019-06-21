import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TablePageComponent } from './components/table-page/table-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: TablePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TableRoutingModule { }
