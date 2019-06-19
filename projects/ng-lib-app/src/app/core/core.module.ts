import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutPageComponent } from './components/layout-page/layout-page.component';
import { NavComponent } from './components/nav/nav.component';

@NgModule({
  declarations: [LayoutPageComponent, NavComponent],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [LayoutPageComponent]
})
export class CoreModule { }
