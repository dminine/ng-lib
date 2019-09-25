import { Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { SubscriptionBaseComponent } from '../core';

export abstract class FormGroupBaseComponent<T = any, F = any> extends SubscriptionBaseComponent implements OnInit {
  @Input()
  get doc(): T { return this._doc; }
  set doc(doc: T) {
    this._doc = doc;
    this.value = doc;
  }
  protected _doc: T;

  @Input()
  set value(value: T) {
    if (value && value !== this._value) {
      this.resetForm(this.convertToFormValue(value));
    }
  }
  protected _value: T;

  @Output() valueChange = new EventEmitter<T>();
  @Output() statusChange = new EventEmitter<any>();

  formGroup: FormGroup;

  protected constructor(
    formGroup?: FormGroup
  ) {
    super();

    this.formGroup = formGroup;
  }

  ngOnInit(): void {
    this.addSubscription(this.initValueChange());
    this.addSubscription(this.initStatusChange());
  }

  protected initValueChange(): Subscription {
    return this.formGroup.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(value => {
      if (this.checkValidValue(value)) {
        this.emit(this.convertToEmitValue(value));
      }
    });
  }

  protected initStatusChange(): Subscription {
    return this.formGroup.statusChanges.subscribe(status => {
      this.statusChange.emit(status);
    });
  }

  protected resetForm(value: F): void {
    if (value) {
      this.formGroup.reset(value);
    }
  }

  protected emit(value: T) {
    this._value = value;
    this.valueChange.emit(value);
  }

  protected convertToEmitValue(value: F): T {
    return value as unknown as T;
  }

  protected convertToFormValue(value: T): F {
    return value as unknown as F;
  }

  protected checkValidValue(value: F): boolean {
    return true;
  }
}
