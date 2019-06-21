import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutPageComponent } from './core/components/layout-page/layout-page.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    children: [
      {
        path: 'firestore',
        loadChildren: () =>
          import('./pages/firestore/firestore.module').then(m => m.FirestorePageModule)
      },
      {
        path: 'form',
        loadChildren: () =>
          import('./pages/form/form.module').then(m => m.FormPageModule)
      },
      {
        path: 'table',
        loadChildren: () =>
          import('./pages/table/table.module').then(m => m.TablePageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
