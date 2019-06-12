import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CompanyService } from './entities/company/company.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
