import { FormGroup } from '@angular/forms';


export interface DnlFormGroup {
  formGroup: FormGroup;
}

export type FormGroupNameConverter = { parent: string, child: string }[];
