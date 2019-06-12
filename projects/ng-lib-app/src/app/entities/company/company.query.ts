import { Injectable } from '@angular/core';
import { CompanyStore, CompanyState } from './company.store';
import { Company } from './types';
import { DnlFirestoreQuery } from 'ng-lib';

@Injectable({ providedIn: 'root' })
export class CompanyQuery extends DnlFirestoreQuery<CompanyState, Company> {

  constructor(protected store: CompanyStore) {
    super(store);
  }
}
