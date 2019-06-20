import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.component.html',
  styleUrls: ['./form-page.component.scss']
})
export class FormPageComponent implements OnInit {

  testControl = new FormControl();

  constructor() { }

  ngOnInit() {
    this.testControl.valueChanges.subscribe(value => {
      console.log(value);
    });
  }

  onValueChange(value: any) {
    console.log(value);
  }

  onStatusChange(status: any) {
    console.log(status);
  }
}
