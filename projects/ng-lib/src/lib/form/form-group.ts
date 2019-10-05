import { EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { HashMap } from '../types';
import { FormGroupNameConverter, NameMap } from './types';

export class DnlFormGroup extends FormGroup {
  controls: HashMap<AbstractControl>;
  valueChanges: EventEmitter<any>;
  statusChanges: EventEmitter<any>;

  private readonly nameMaps: NameMap[];

  constructor(
    protected formGroup: FormGroup,
    protected nameConverter: FormGroupNameConverter
  ) {
    super({}, formGroup.validator, formGroup.asyncValidator);

    this.nameMaps = this.convertToNameMap();
    this.setParent(formGroup.parent);
    this.controls = this.setControls(formGroup.controls);
    this.initValueChanges();
    this.initStatusChanges();
  }

  setValue(value: { [p: string]: any }, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    super.setValue(value, { ...options, emitEvent: false });
    this.formGroup.updateValueAndValidity(options);
  }

  patchValue(value: { [p: string]: any }, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    super.patchValue(value, { ...options, emitEvent: false });
    this.formGroup.updateValueAndValidity(options);
  }

  reset(value?: any, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    super.reset(value, { ...options, emitEvent: false });
    this.formGroup.updateValueAndValidity(options);
  }

  private setControls(controls: HashMap<AbstractControl>): HashMap<AbstractControl> {
    if (!this.nameMaps) {
      return controls;
    }

    const childControls = {} as HashMap<AbstractControl>;

    for (const nameMap of this.nameMaps) {
      childControls[nameMap.child] = controls[nameMap.parent];
    }

    return childControls;
  }

  private valueChangesMap(value: any, from: 'parent' | 'child', to: 'parent' | 'child') {
    if (!this.nameMaps) {
      return value;
    }

    const childValue = {} as any;

    for (const nameMap of this.nameMaps) {
      childValue[nameMap[to]] = value[nameMap[from]];
    }

    return childValue;
  }

  private convertToNameMap(): NameMap[] {
    if (!this.nameConverter) {
      return undefined;
    }

    let nameConverter: FormGroupNameConverter = this.nameConverter;

    if (typeof nameConverter === 'string') {
      nameConverter = nameConverter.split(';').map(nc => nc.trim());
    }

    for (let i = 0; i < nameConverter.length; i++) {
      if (typeof nameConverter[i] === 'string') {
        const splitNamMap = (nameConverter[i] as string).split(' as ').map(nm => nm.trim());

        if (splitNamMap.length === 1) {
          nameConverter[i] = { parent: splitNamMap[0], child: splitNamMap[0] };
        } else if (splitNamMap.length === 2) {
          nameConverter[i] = { parent: splitNamMap[1], child: splitNamMap[0] };
        } else {
          throw new Error('nameMap length 오류');
        }
      }
    }

    return nameConverter as NameMap[];
  }

  private initValueChanges() {
    this.valueChanges = this.formGroup.valueChanges.pipe(
      map(value => this.valueChangesMap(value, 'parent', 'child'))
    ) as EventEmitter<any>;
    this.valueChanges.emit = (this.formGroup.valueChanges as EventEmitter<any>).emit;
  }

  private initStatusChanges() {
    this.statusChanges = this.formGroup.statusChanges as EventEmitter<any>;
  }
}
