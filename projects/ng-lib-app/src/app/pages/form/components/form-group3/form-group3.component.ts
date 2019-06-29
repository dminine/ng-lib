import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormGroupBaseComponent, DnlFormGroup } from 'ng-lib';

@DnlFormGroup
@Component({
  selector: 'app-form-group3',
  templateUrl: './form-group3.component.html',
  styleUrls: ['./form-group3.component.scss']
})
export class FormGroup3Component extends FormGroupBaseComponent {
  visibility = false;

  constructor() {
    super(
      {
        formGroup3_1: new FormControl('2'),
        formGroup3_2: new FormControl('3'),
        formGroup3_3: new FormControl('4'),
      }
    );
    setTimeout(() => {
      this.visibility = true;
    }, 2000);
  }

}
