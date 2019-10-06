import { Component, forwardRef, AfterContentInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  DnlGroupValueAccessor,
  DNL_GROUP_VALUE_ACCESSOR,
  AbstractControlType,
  FormGroupBaseComponent
} from '../../../../../../../ng-lib/src/lib/form';
import { DnlFormGroup } from '../../../../../../../ng-lib/src/lib/form/form-group';
import { HashMap } from '../../../../../../../ng-lib/src/lib/types';

@Component({
  selector: 'app-form-group5',
  templateUrl: './form-group5.component.html',
  styleUrls: ['./form-group5.component.scss'],
  providers: [
    { provide: DNL_GROUP_VALUE_ACCESSOR, useExisting: forwardRef(() => FormGroup5Component) }
  ]
})
export class FormGroup5Component extends FormGroupBaseComponent implements DnlGroupValueAccessor {
  formGroup: DnlFormGroup = this.createForm() as DnlFormGroup;
  controlTypeMap: HashMap<AbstractControlType> = {
    a: 'formGroup',
    b: 'formGroup'
  };

  constructor(
    private fb: FormBuilder
  ) {
    super();
  }

  private createForm() {
    return this.fb.group({
      a: this.fb.group({
        ab: [null],
        c: [null]
      }),
      b: this.fb.group({
        d: [null],
        e: [null]
      })
    });
  }
}
