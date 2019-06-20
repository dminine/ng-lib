import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormGroupBaseComponent, DnlFormGroup } from '../../../../../../../ng-lib/src/lib/form';

@DnlFormGroup
@Component({
  selector: 'app-form-group2',
  templateUrl: './form-group2.component.html',
  styleUrls: ['./form-group2.component.scss']
})
export class FormGroup2Component extends FormGroupBaseComponent {

  constructor() {
    super({ formGroup2_1: new FormControl('', Validators.required) });
  }

}
