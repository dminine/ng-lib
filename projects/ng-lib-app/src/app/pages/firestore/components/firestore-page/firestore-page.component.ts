import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { CompanyService } from '../../../../entities/company/company.service';
import { TeamService } from '../../../../entities/team/team.service';

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
  teams$ = this.teamService.list({}, { group: true }).pipe(
    tap(response => {
      console.log(response);
    })
  );
  count$ = this.companyService.count();

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private teamService: TeamService
  ) {
    this.teamService.list({}, { group: true }).subscribe(response => {
      console.log(response);
    });
  }

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
