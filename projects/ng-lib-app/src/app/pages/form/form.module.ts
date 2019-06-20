import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FormRoutingModule } from './form-routing.module';
import { FormPageComponent } from './components/form-page/form-page.component';
import { FormGroup1Component } from './components/form-group1/form-group1.component';
import { FormGroup2Component } from './components/form-group2/form-group2.component';
import { FormGroup3Component } from './components/form-group3/form-group3.component';
import { FormGroup4Component } from './components/form-group4/form-group4.component';
import { FormGroup5Component } from './components/form-group5/form-group5.component';

@NgModule({
  declarations: [
    FormPageComponent,
    FormGroup1Component,
    FormGroup2Component,
    FormGroup3Component,
    FormGroup4Component,
    FormGroup5Component
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormRoutingModule
  ]
})
export class FormPageModule {}
