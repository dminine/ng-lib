import { Directive, Input, Optional, Self, Inject, SkipSelf, Host, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { SubscriptionBaseComponent } from '../core';
import { DnlFormGroup } from './form-group';
import { DNL_GROUP_VALUE_ACCESSOR } from './tokens';
import { DnlGroupValueAccessor, FormGroupNameConverter } from './types';

@Directive({
  selector: '[dnlFormGroupName]'
})
export class FormGroupNameDirective extends SubscriptionBaseComponent implements OnInit {
  @Input('dnlFormGroupName') name: string;
  @Input() nameConverter: FormGroupNameConverter;

  constructor(
    @Optional() @Host() @SkipSelf() private parent: ControlContainer,
    @Optional() @Self() @Inject(DNL_GROUP_VALUE_ACCESSOR) private groupValueAccessor: DnlGroupValueAccessor
  ) {
    super();
  }

  ngOnInit(): void {
    this.setFormValue();
  }

  private setFormValue() {
    const formGroup = this.name ? this.parent.control.get(this.name) as FormGroup : this.parent.control as FormGroup;

    if (!(formGroup instanceof FormGroup)) {
      throw new Error('선택 된 Control은 FormGroup이 아닙니다');
    }

    this.groupValueAccessor.formGroup = new DnlFormGroup(
      formGroup,
      this.groupValueAccessor.controlTypeMap,
      this.nameConverter
    );
  }
}
