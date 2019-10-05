import { HashMap } from '../types';
import { DnlFormGroup } from './form-group';


export interface DnlGroupValueAccessor {
  formGroup: DnlFormGroup;
  controlTypeMap: HashMap<AbstractControlType>;
}

export type AbstractControlType = 'formGroup' | 'formArray' | 'formControl';

export type FormGroupNameConverter = NameMap[] | string[] | string;

export interface NameMap {
  parent: string;
  child: string;
}
