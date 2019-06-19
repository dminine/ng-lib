import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FirestorePageComponent } from './components/firestore-page/firestore-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: FirestorePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FirestoreRoutingModule { }
