import { Component, OnInit, forwardRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DNL_FORM_GROUP } from '../../../../../../../ng-lib/src/lib/form';
import { DnlFormGroup } from '../../../../../../../ng-lib/src/lib/form';

@Component({
  selector: 'app-form-group4',
  templateUrl: './form-group4.component.html',
  styleUrls: ['./form-group4.component.scss'],
  providers: [
    { provide: DNL_FORM_GROUP, useExisting: forwardRef(() => FormGroup4Component) }
  ]
})
export class FormGroup4Component implements OnInit, DnlFormGroup {
  formGroup = this.createForm();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.formGroup.valueChanges.subscribe(value => {
      console.log('4', value);
    });
  }

  private createForm() {
    return this.fb.group({
      a: [null],
      b: [null]
    });
  }
}
