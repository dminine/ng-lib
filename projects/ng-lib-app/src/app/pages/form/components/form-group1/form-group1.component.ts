import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormGroupBaseComponent } from 'ng-lib';

@Component({
  selector: 'app-form-group1',
  templateUrl: './form-group1.component.html',
  styleUrls: ['./form-group1.component.scss']
})
export class FormGroup1Component extends FormGroupBaseComponent {

  constructor(
    private fb: FormBuilder
  ) {
    super(fb.group({ formGroup1_1: fb.control(['']) }));
  }

}
