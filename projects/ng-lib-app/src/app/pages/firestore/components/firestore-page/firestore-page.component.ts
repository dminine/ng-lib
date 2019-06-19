import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { CompanyService } from '../../../../entities/company/company.service';

@Component({
  selector: 'app-firestore-page',
  templateUrl: './firestore-page.component.html',
  styleUrls: ['./firestore-page.component.scss']
})
export class FirestorePageComponent {
  companyForm = this.fb.group({
    name: ['', Validators.required]
  });

  companies$ = this.companyService.list();
  count$ = this.companyService.count();

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService
  ) {}

  onSubmit() {
    this.companyService.upsert('abc', this.companyForm.value).subscribe(response => {
      console.log(response);
    });
    this.companyForm.reset();
  }

  delete(id: string) {
    this.companyService.delete(id);
  }
}
