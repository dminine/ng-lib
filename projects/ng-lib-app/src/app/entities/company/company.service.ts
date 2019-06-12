import { Injectable } from '@angular/core';
import { CompanyState, CompanyStore } from './company.store';
import { CompanyQuery } from './company.query';
import { DnlFirestoreService } from 'ng-lib';
import { AngularFirestore } from '@angular/fire/firestore';
import { Company } from './types';

@Injectable({ providedIn: 'root' })
export class CompanyService extends DnlFirestoreService<CompanyState, Company> {
  constructor(
    protected companyStore: CompanyStore,
    protected companyQuery: CompanyQuery,
    protected afs: AngularFirestore
  ) {
    super(companyStore, companyQuery, afs, 'companies');
  }
}
