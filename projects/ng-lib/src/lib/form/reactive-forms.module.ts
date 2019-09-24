import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroupNameDirective } from './form-group-name.directive';

@NgModule({
  declarations: [FormGroupNameDirective],
  exports: [
    FormGroupNameDirective
  ],
  imports: [
    CommonModule
  ]
})
export class DnlReactiveFormsModule { }
