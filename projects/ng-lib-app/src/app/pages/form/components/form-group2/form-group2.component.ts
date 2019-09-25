import { Component } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { FormGroupBaseComponent } from 'ng-lib';

@Component({
  selector: 'app-form-group2',
  templateUrl: './form-group2.component.html',
  styleUrls: ['./form-group2.component.scss']
})
export class FormGroup2Component extends FormGroupBaseComponent {

  constructor() {
    super(
      new FormGroup({
        formGroup2_1: new FormControl('', Validators.required),
        formGroup2_group1: new FormGroup({
          formGroup2_group1_1: new FormControl(null)
        })
      })
    );
  }

  protected convertToEmitValue(value: any): any {
    console.log(value);
    this.formGroup.get('formGroup2_group1').setValue({ formGroup2_group1_1: '메롱' }, { emitEvent: false });
    return { ...value, formGroup2_group1: { formGroup2_group1_1: '메롱' } };
  }
}
