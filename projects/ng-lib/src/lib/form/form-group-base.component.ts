import { Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { SubscriptionBaseComponent } from '../core';


export abstract class FormGroupBaseComponent<T = any> extends SubscriptionBaseComponent implements OnInit {
  @Input()
  set value(value: T) {
    if (value && value !== this._value) {
      this.resetForm(value);
    }
  }
  private _value: T;

  @Output() valueChange = new EventEmitter<T>();
  @Output() statusChange = new EventEmitter<any>();

  protected constructor(
    public formGroup: FormGroup
  ) {
    super();
  }

  ngOnInit() {
    this.subscription.add(this.initValueChange());
    this.subscription.add(this.initStatusChange());
    Promise.resolve(null).then(() => {
      this.formGroup.updateValueAndValidity();
    });
  }

  protected resetForm(value: T): void {
    this.formGroup.reset(value, { emitEvent: false });
  }

  protected initValueChange(): Subscription {
    return this.formGroup.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(value => {
      Promise.resolve(null).then(() => {
        this._value = value;
        this.valueChange.emit(this._value);
      });
    });
  }

  private initStatusChange(): Subscription {
    return this.formGroup.statusChanges.subscribe(status => {
      this.statusChange.emit(status);
    });
  }
}
