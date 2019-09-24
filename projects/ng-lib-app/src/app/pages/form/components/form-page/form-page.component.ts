import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.component.html',
  styleUrls: ['./form-page.component.scss']
})
export class FormPageComponent implements OnInit {
  test: any;

  testControl = new FormControl();
  visibility = true;

  formGroup = new FormGroup({
    a: new FormGroup({
      a: new FormControl(null),
    }),
    b: new FormControl(null)
  });

  constructor() { }

  ngOnInit() {
    this.formGroup.valueChanges.subscribe(value => {
      console.log(value);
    });
    this.testControl.valueChanges.subscribe(value => {
      console.log(value);
    });
    setTimeout(() => {
      this.formGroup.setValue({
        a: {
          a: '1'
        },
        b: '2'
      });
      this.test = {
        formGroup1_1: 'test',
        'form-group3': {
          formGroup3_1: '3',
          FormGroup2Component: { formGroup2_1: 'beep' }
        }
      };
    }, 1000);
    // setTimeout(() => {
    //   this.visibility = true;
    // }, 2000);
  }

  onValueChange(value: any) {
    console.log(value);
  }

  onStatusChange(status: any) {
    console.log(status);
  }
}
