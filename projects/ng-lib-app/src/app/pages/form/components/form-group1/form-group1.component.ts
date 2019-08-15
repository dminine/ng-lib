import { Component, forwardRef } from '@angular/core';
import { FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormGroupBaseComponent, DnlFormGroup } from '@dminine/ng-lib';

@Component({
  selector: 'app-form-group1',
  templateUrl: './form-group1.component.html',
  styleUrls: ['./form-group1.component.scss'],
  providers: [
    {
      provide: FormGroupBaseComponent,
      useExisting: forwardRef(() => FormGroup1Component)
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormGroup1Component),
      multi: true
    }
  ]
})
@DnlFormGroup
export class FormGroup1Component extends FormGroupBaseComponent {

  constructor(
    private fb: FormBuilder
  ) {
    super({ formGroup1_1: fb.control(['']) });
  }

}
