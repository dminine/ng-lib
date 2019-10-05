import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormGroupBaseComponent } from '../../../../../../../ng-lib/src/lib/form';

@Component({
  selector: 'app-form-group4',
  templateUrl: './form-group4.component.html',
  styleUrls: ['./form-group4.component.scss']
})
export class FormGroup4Component extends FormGroupBaseComponent implements OnInit {
  formGroup = this.createForm();

  constructor(
    private fb: FormBuilder
  ) {
    super();
  }

  ngOnInit() {
    this.formGroup.valueChanges.subscribe(value => {
      console.log('4', value);
    });
  }

  private createForm() {
    return this.fb.group({
      a: this.fb.group({
        ab: [null],
        c: [null]
      }),
      b: [null]
    });
  }
}
