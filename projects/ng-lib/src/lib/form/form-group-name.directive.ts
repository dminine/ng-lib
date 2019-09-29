import { Directive, Input, Optional, Self, Inject, SkipSelf, Host, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { SubscriptionBaseComponent } from '../core';
import { DNL_FORM_GROUP } from './tokens';
import { DnlFormGroup, FormGroupNameConverter } from './types';
import * as objectPath from 'object-path';



@Directive({
  selector: '[dnlFormGroupName]'
})
export class FormGroupNameDirective extends SubscriptionBaseComponent implements OnInit {
  @Input('dnlFormGroupName') nameMap: FormGroupNameConverter;

  private nameConverter: FormGroupNameConverter;
  private emittedFormValue: any;

  constructor(
    @Optional() @Host() @SkipSelf() private parent: ControlContainer,
    @Optional() @Self() @Inject(DNL_FORM_GROUP) private formGroupAccessor: DnlFormGroup
  ) {
    super();
  }

  ngOnInit(): void {
    this.nameConverter = this.nameMap;
    this.setUpFormGroup();
  }

  private setUpFormGroup() {
    const parentFormGroup = this.parent.control as FormGroup;
    const childFormGroup = this.formGroupAccessor.formGroup;

    childFormGroup.patchValue(this.convertFormValue('toChild', parentFormGroup.value));

    this.addSubscription(this.setUpPipeline('toChild', parentFormGroup, childFormGroup));
    this.addSubscription(this.setUpPipeline('toParent', childFormGroup, parentFormGroup));


    this.setUpDisabledPipeline(parentFormGroup, childFormGroup);
    // if (childFormGroup.controls[0].updateOn.) {
    //   control.registerOnDisabledChange(
    //     (isDisabled: boolean) => { dir.valueAccessor !.setDisabledState !(isDisabled); });
    // }
  }

  private setUpPipeline(type: 'toParent' | 'toChild', from: FormGroup, to: FormGroup) {
    return from.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      filter(value => JSON.stringify(this.emittedFormValue) !== JSON.stringify(value))
    ).subscribe(parentFormValue => {
      to.patchValue(this.convertFormValue(type, parentFormValue), { emitEvent: false });
      this.emittedFormValue = to.value;
      to.updateValueAndValidity();
    });
  }

  private convertFormValue(type: 'toParent' | 'toChild', fromValue: any) {
    if (!this.nameConverter) {
      return fromValue;
    }

    const toValue = {};

    for (const map of this.nameConverter) {
      const from = type === 'toParent' ? map.child : map.parent;
      const to = type === 'toParent' ? map.parent : map.child;

      objectPath.set(toValue, to, objectPath.get(fromValue, from));
    }

    return toValue;
  }

  private setUpDisabledPipeline(parentFormGroup: FormGroup, childFormGroup: FormGroup) {
    for (const i in parentFormGroup.controls) {
      if (parentFormGroup.controls.hasOwnProperty(i)) {
        // parentFormGroup.controls[i]
      }
    }
  }
}
