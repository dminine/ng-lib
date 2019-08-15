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
import { distinctUntilChanged, tap, filter, first } from 'rxjs/operators';
import { SubscriptionBaseComponent, delayMicrotask } from '../core';
import { HashMap } from '../types';
import 'reflect-metadata';

export function DnlFormGroup(constructor: Type<any>) {
  const metadataKeys = Reflect.getMetadataKeys(constructor);
  console.log(metadataKeys);

  metadataKeys.forEach((key) => {
    const onMetadata = Reflect.getOwnMetadata(key, constructor);
    console.log(onMetadata);
    console.log(Reflect.getMetadata(key, constructor));
  });
  console.log(Reflect.getOwnPropertyDescriptor(constructor, '__annotations__'));
  console.log(Reflect.getPrototypeOf(constructor));
  console.log(Reflect.ownKeys(constructor));
  console.log(constructor);
  console.log(constructor.prototype);
  return constructor;

  // if (!(constructor as any).__annotations__) {
  //   throw new Error('Must be in front of Component decorator.');
  // }
  //
  // const annotation: Component = (constructor as any).__annotations__[0];
  // const formGroupProvider = {
  //   provide: FormGroupBaseComponent,
  //   useExisting: forwardRef(() => constructor)
  // };
  // const valueAccessorProvider = {
  //   provide: NG_VALUE_ACCESSOR,
  //   useExisting: forwardRef(() => constructor),
  //   multi: true
  // };
  //
  // if (annotation.providers) {
  //   annotation.providers.push(formGroupProvider, valueAccessorProvider);
  // } else {
  //   annotation.providers = [formGroupProvider, valueAccessorProvider];
  // }
  //
  // return constructor;
}

export abstract class FormGroupBaseComponent<T = any> extends SubscriptionBaseComponent
  implements AfterViewInit, ControlValueAccessor {

  @Input() name: string;
  @Input() flat = false;

  @Input()
  get doc(): T { return this._doc; }
  set doc(doc: T) {
    this._doc = doc;
    this.value = doc;
  }
  private _doc: T;

  @Input()
  set value(value: T) {
    if (value && value !== this._value) {
      this.isMadeFormGroup$.asObservable().pipe(
        first(isMade => isMade)
      ).subscribe(() => {
        this.resetForm(value);
      });
    }
  }
  private _value: T;

  @Output() valueChange = new EventEmitter<T>();
  @Output() statusChange = new EventEmitter<any>();
  @Output() formGroupChange = new EventEmitter<FormGroupBaseComponent>();

  @ViewChildren(FormGroupBaseComponent) formGroupComponents: QueryList<FormGroupBaseComponent>;

  formGroup: FormGroup;

  private isMadeFormGroup$ = new BehaviorSubject<boolean>(false);

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
  }

  writeValue(obj: any): void {
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

  protected resetForm(value: T): void {
    this.formGroup.reset(value, { emitEvent: false });
  }

  protected initValueChange(): Subscription {
    return this.formGroup.valueChanges
      .pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)))
      .subscribe(value => {
        this._value = value;
        this.onChange(value);
        this.valueChange.emit(this._value);
      });
  }

  private initFormGroup() {
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

  private initStatusChange(): Subscription {
    return this.formGroup.statusChanges.subscribe(status => {
      this.statusChange.emit(status);
    });
  }

  private deferSubFormGroups() {
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

  private makeFormGroup() {
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
}
