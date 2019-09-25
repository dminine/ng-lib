import { Directive, Input, Optional, Self, Inject, SkipSelf, Host, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
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

    this.addSubscription(this.setUpUpstreamPipeline(parentFormGroup, childFormGroup));
    this.addSubscription(this.setUpDownstreamPipeline(parentFormGroup, childFormGroup));
  }

  private setUpUpstreamPipeline(parentFormGroup: FormGroup, childFormGroup: FormGroup) {
    return childFormGroup.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(childFormValue => {
      parentFormGroup.patchValue(this.convertFormValue('toParent', childFormValue));
    });
  }

  private setUpDownstreamPipeline(parentFormGroup: FormGroup, childFormGroup: FormGroup) {
    return parentFormGroup.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(parentFormValue => {
      childFormGroup.patchValue(this.convertFormValue('toChild', parentFormValue));
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
}
