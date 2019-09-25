import { Component, forwardRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DnlFormGroup, DNL_FORM_GROUP } from '../../../../../../../ng-lib/src/lib/form';

@Component({
  selector: 'app-form-group5',
  templateUrl: './form-group5.component.html',
  styleUrls: ['./form-group5.component.scss'],
  providers: [
    { provide: DNL_FORM_GROUP, useExisting: forwardRef(() => FormGroup5Component) }
  ]
})
export class FormGroup5Component implements DnlFormGroup {
  formGroup = new FormGroup({
    a: new FormControl(null),
    b: new FormControl(null)
  });

  constructor() {
    this.formGroup.valueChanges.subscribe(value => {
      console.log('5', value);
    });
  }
}
