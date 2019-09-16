import { OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, ValidatorFn, AbstractControlOptions, AsyncValidatorFn, ControlValueAccessor } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { SubscriptionBaseComponent } from '../core';

export abstract class FormControlBaseComponent<T = any> extends SubscriptionBaseComponent implements OnInit, ControlValueAccessor {
  @Input()
  set value(value: T) {
    if (value && value !== this._value) {
      this.formCtrl.setValue(value, { emitEvent: false });
    }
  }
  protected _value: T;

  @Output() valueChange = new EventEmitter<T>();

  formCtrl: FormControl;

  onChange: any = () => {};
  onTouch: any = () => {};

  protected constructor(
    protected formState?: any,
    protected validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    protected asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super();

    this.formCtrl = new FormControl(formState, validatorOrOpts, asyncValidator);
  }

  ngOnInit(): void {
    this.subscription.add(this.initValueChange());
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
    this.formCtrl.setValue(value, { emitEvent: false });
  }

  protected initValueChange() {
    return this.formCtrl.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(value => {
      this._value = value;
      this.onChange(value);
      this.valueChange.emit(this._value);
    });
  }
}
