import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.component.html',
  styleUrls: ['./form-page.component.scss']
})
export class FormPageComponent implements OnInit {
  test: any;

  testControl = new FormControl();
  visibility = false;

  constructor() { }

  ngOnInit() {
    this.testControl.valueChanges.subscribe(value => {
      console.log(value);
    });
    setTimeout(() => {
      this.test = { formGroup1_1: 'test', formGroup3_1: '3' };
    }, 1000);
    setTimeout(() => {
      this.visibility = true;
    }, 2000);
  }

  onValueChange(value: any) {
    console.log(value);
  }

  onStatusChange(status: any) {
    console.log(status);
  }
}
