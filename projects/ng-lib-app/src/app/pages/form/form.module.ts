import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormRoutingModule } from './form-routing.module';
import { FormPageComponent } from './components/form-page/form-page.component';

@NgModule({
  declarations: [FormPageComponent],
  imports: [
    CommonModule,
    FormRoutingModule
  ]
})
export class FormPageModule { }
