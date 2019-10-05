import { DnlFormGroup } from './form-group';


export interface DnlGroupValueAccessor {
  formGroup: DnlFormGroup;
}

export type FormGroupNameConverter = NameMap[] | string[] | string;

export interface NameMap {
  parent: string;
  child: string;
}
