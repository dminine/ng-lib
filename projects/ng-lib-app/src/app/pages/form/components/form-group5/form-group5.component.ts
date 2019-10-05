import { Component, forwardRef, AfterContentInit } from '@angular/core';
import { delayTask } from '../../../../../../../ng-lib/src/lib/core';
import { DnlGroupValueAccessor, DNL_GROUP_VALUE_ACCESSOR } from '../../../../../../../ng-lib/src/lib/form';
import { DnlFormGroup } from '../../../../../../../ng-lib/src/lib/form/form-group';

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

  constructor() {
  }

  ngAfterContentInit(): void {
    this.formGroup.get('cd').valueChanges.subscribe(value => {
      console.log('5.cd', value);
    });
    this.formGroup.valueChanges.subscribe(value => {
      console.log('5', value);
    });
    this.formGroup.statusChanges.subscribe(status => {
      console.log('5', status);
    });
  }

}
