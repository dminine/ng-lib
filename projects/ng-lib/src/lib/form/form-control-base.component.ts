import { OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, ValidatorFn, AbstractControlOptions, AsyncValidatorFn, ControlValueAccessor } from '@angular/forms';
import { SubscriptionBaseComponent, delayMicrotask } from '../core';

export abstract class FormControlBaseComponent<T = any, C = any> extends SubscriptionBaseComponent implements OnInit, ControlValueAccessor {
  @Input()
  set value(value: T) {
    if (value && value !== this._value) {
      this.resetControl(this.convertToControlValue(value));
    }
  }
  protected _value: T;

  @Output() valueChange = new EventEmitter<T>();

  formCtrl: FormControl;

  protected onChange: any = () => {};
  protected onTouch: any = () => {};

  protected constructor(
    protected formState?: any,
    protected validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    protected asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super();

    this.formCtrl = new FormControl(formState, validatorOrOpts, asyncValidator);
  }

  ngOnInit(): void {
    this.setSubscription('value-change', this.initValueChange());
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.formCtrl.disable() : this.formCtrl.enable();
  }

  writeValue(value: T): void {
    this.resetControl(this.convertToControlValue(value));
  }

  protected initValueChange() {
    return this.formCtrl.valueChanges.subscribe(value => {
      delayMicrotask(() => {
        if (this.checkValidValue(value)) {
          this.emit(this.convertToEmitValue(value));
        }
      });
    });
  }

  protected resetControl(value: C) {
    this.formCtrl.setValue(value, { emitEvent: false });
  }

  protected emit(value: T) {
    this._value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  protected convertToEmitValue(value: C): T {
    return value as unknown as T;
  }

  protected convertToControlValue(value: T): C {
    return value as unknown as C;
  }

  protected checkValidValue(value: C): boolean {
    return true;
  }
}
