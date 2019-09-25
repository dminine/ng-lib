import { Input, Output, EventEmitter, AfterViewInit, ViewChildren, QueryList, Type, Component, forwardRef } from '@angular/core';
import {
  FormGroup,
  AbstractControl,
  ValidatorFn,
  AbstractControlOptions,
  AsyncValidatorFn, NG_VALUE_ACCESSOR, ControlValueAccessor
} from '@angular/forms';
import { Subscription, combineLatest, of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { tap, filter, first } from 'rxjs/operators';
import { SubscriptionBaseComponent, delayMicrotask } from '../core';
import { HashMap } from '../types';

export abstract class FormGroupBaseComponent<T = any, F = any> extends SubscriptionBaseComponent
  implements AfterViewInit, ControlValueAccessor {

  @Input() name: string;
  @Input() flat = false;

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
      this.isMadeFormGroup$.asObservable().pipe(
        first(isMade => isMade)
      ).subscribe(() => {
        this.resetForm(this.convertToFormValue(value));
      });
    }
  }
  protected _value: T;

  @Output() valueChange = new EventEmitter<T>();
  @Output() statusChange = new EventEmitter<any>();
  @Output() formGroupChange = new EventEmitter<FormGroupBaseComponent>();

  @ViewChildren(FormGroupBaseComponent) formGroupComponents: QueryList<FormGroupBaseComponent>;

  formGroup: FormGroup;

  protected isMadeFormGroup$ = new BehaviorSubject<boolean>(false);

  onChange: any = () => {};
  onTouch: any = () => {};

  protected constructor(
    protected defaultControls: HashMap<AbstractControl> = {},
    protected validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    protected asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super();

    this.formGroup = new FormGroup(defaultControls, validatorOrOpts, asyncValidator);
  }

  ngAfterViewInit(): void {
    this.subscription.add(this.initFormGroup());
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.formGroup.disable() : this.formGroup.enable();
  }

  writeValue(value: T): void {
    this.resetForm(this.convertToFormValue(value));
  }

  setChildFormGroup(childFormGroupComponent: FormGroupBaseComponent) {
    if (childFormGroupComponent.flat) {
      if (this.doc) {
        childFormGroupComponent.formGroup.patchValue(this.doc, { emitEvent: false });
      }

      for (const i in childFormGroupComponent.formGroup.controls) {
        if (childFormGroupComponent.formGroup.controls.hasOwnProperty(i)) {
          this.formGroup.addControl(i, childFormGroupComponent.formGroup.controls[i]);
        }
      }

    } else {
      if (this.doc) {
        childFormGroupComponent.formGroup.patchValue(
          this.doc[childFormGroupComponent.name || childFormGroupComponent.constructor.name] || {},
          { emitEvent: false }
        );
      }

      this.formGroup.addControl(
        childFormGroupComponent.name || childFormGroupComponent.constructor.name,
        childFormGroupComponent.formGroup
      );
    }

    this.formGroup.updateValueAndValidity();
    this.formGroupChange.emit(this);
  }

  protected initValueChange(): Subscription {
    return this.formGroup.valueChanges.subscribe(value => {
      if (this.checkValidValue(value)) {
        this.emit(this.convertToEmitValue(value));
      }
    });
  }

  protected initFormGroup() {
    return this.deferSubFormGroups().subscribe(() => {
      delayMicrotask(() => {
        this.subscription.add(this.initValueChange());
        this.subscription.add(this.initStatusChange());
        this.formGroup.updateValueAndValidity();

        this.isMadeFormGroup$.next(true);
        this.formGroupChange.emit(this);
      });
    });
  }

  protected initStatusChange(): Subscription {
    return this.formGroup.statusChanges.subscribe(status => {
      this.statusChange.emit(status);
    });
  }

  protected deferSubFormGroups() {
    if (this.formGroupComponents.length) {
      return combineLatest(
        this.formGroupComponents.map(component => component.isMadeFormGroup$.asObservable())
      ).pipe(
        filter(isMadeArray => isMadeArray.every(isMade => isMade)),
        tap(() => this.makeFormGroup())
      );

    } else {
      return of(null);
    }
  }

  protected makeFormGroup() {
    const subFormGroupMap = this.formGroupComponents.reduce(
      (prev, curr) => {
        if (curr.flat) {
          return { ...prev, ...curr.formGroup.controls };

        } else {
          return { ...prev, [curr.name || curr.constructor.name]: curr.formGroup };
        }
      },
      this.defaultControls
    );

    this.formGroup = new FormGroup(subFormGroupMap, this.validatorOrOpts, this.asyncValidator);
  }

  protected resetForm(value: F): void {
    if (value) {
      this.formGroup.reset(value, { emitEvent: false });
    }
  }

  protected emit(value: T) {
    this._value = value;
    this.onChange(value);
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
