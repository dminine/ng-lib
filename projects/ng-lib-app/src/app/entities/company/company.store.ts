import { Injectable } from '@angular/core';
import { StoreConfig } from '@datorama/akita';
import { Company } from './types';
import { DnlFirestoreState, DnlFirestoreStore } from '@dminine/ng-lib';

export interface CompanyState extends DnlFirestoreState<Company> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'company' })
export class CompanyStore extends DnlFirestoreStore<CompanyState, Company> {

  constructor() {
    super();
  }

}

