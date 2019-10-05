import { Component, forwardRef, AfterContentInit } from '@angular/core';
import { DnlGroupValueAccessor, DNL_GROUP_VALUE_ACCESSOR, AbstractControlType } from '../../../../../../../ng-lib/src/lib/form';
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
export class FormGroup5Component implements AfterContentInit, DnlGroupValueAccessor {
  formGroup: DnlFormGroup;
  controlTypeMap: HashMap<AbstractControlType> = {
    a: 'formGroup',
    b: 'formGroup'
  };

  constructor() {
  }

  ngAfterContentInit(): void {
    this.formGroup.valueChanges.subscribe(value => {
      console.log('5', value);
    });
  }


}
