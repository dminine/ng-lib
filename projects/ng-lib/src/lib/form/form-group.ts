import { EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { HashMap } from '../types';
import { FormGroupNameConverter, NameMap, AbstractControlType } from './types';

export class DnlFormGroup extends FormGroup {
  controls: HashMap<AbstractControl>;
  valueChanges: EventEmitter<any>;
  statusChanges: EventEmitter<any>;

  private readonly nameMaps: NameMap[];

  constructor(
    protected formGroup: FormGroup,
    protected controlTypeMap: HashMap<AbstractControlType>,
    protected nameConverter?: FormGroupNameConverter
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

  private convertToNameMap(): NameMap[] {
    let nameMaps: FormGroupNameConverter = this.nameConverter;

    if (this.nameConverter) {
      if (typeof nameMaps === 'string') {
        nameMaps = nameMaps.split(',').map(nc => nc.trim());
      }

      for (let i = 0; i < nameMaps.length; i++) {
        const nameMap = nameMaps[i];

        if (typeof nameMap === 'string') {
          const splitNamMap = nameMap.split(' as ').map(nm => nm.trim());

          if (splitNamMap.length === 1) {
            nameMaps[i] = { parent: splitNamMap[0], child: splitNamMap[0] };
          } else if (splitNamMap.length === 2) {
            nameMaps[i] = { parent: splitNamMap[1], child: splitNamMap[0] };
          } else {
            throw new Error('nameMap length 오류');
          }
        }
      }

    } else {
      nameMaps = Object.keys(this.controlTypeMap).map(key => ({ parent: key, child: key }));

    }

    return nameMaps as NameMap[];
  }

  private setControls(controls: HashMap<AbstractControl>): HashMap<AbstractControl> {
    const childControls = {} as HashMap<AbstractControl>;

    for (const nameMap of this.nameMaps) {
      if (!this.controlTypeMap[nameMap.child]) {
        throw new Error(`nameConverter 설정이 잘못되었습니다: ${nameMap.child}`);
      }

      if (!this.checkControlType(this.controlTypeMap[nameMap.child], controls[nameMap.parent])) {
        throw new Error(`controlTypeMap 설정이 잘못되었습니다: { ${nameMap.child}: ${this.controlTypeMap[nameMap.child]} }`);
      }

      childControls[nameMap.child] = controls[nameMap.parent];
    }

    return childControls;
  }

  private initValueChanges() {
    this.valueChanges = this.formGroup.valueChanges.pipe(
      distinctUntilChanged(this.valueChangesDistinct.bind(this)),
      map(this.valueChangesMap.bind(this))
    ) as EventEmitter<any>;
    this.valueChanges.emit = (this.formGroup.valueChanges as EventEmitter<any>).emit;
  }

  private valueChangesDistinct(prev: any, curr: any) {
    for (const nameMap of this.nameMaps) {
      if (prev[nameMap.parent] !== curr[nameMap.parent]) {
        return false;
      }
    }
    return true;
  }

  private valueChangesMap(value: any) {
    const childValue = {} as any;

    for (const nameMap of this.nameMaps) {
      childValue[nameMap.child] = value[nameMap.parent];
    }

    return childValue;
  }

  private initStatusChanges() {
    this.statusChanges = this.formGroup.statusChanges as EventEmitter<any>;
  }

  private checkControlType(type: AbstractControlType, control: AbstractControl) {
    switch (type) {
      case 'formGroup':
        return control instanceof FormGroup;
      case 'formArray':
        return control instanceof FormArray;
      case 'formControl':
        return control instanceof FormControl;
    }
    return false;
  }
}
