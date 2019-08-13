import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TeamService } from '../../../../entities/team/team.service';
import { Team } from '../../../../entities/team/types';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent {
  @Input()
  get companyId(): string { return this._companyId; }
  set companyId(companyId: string) {
    this._companyId = companyId;
    this.teams$ = this.teamService.list({}, { parents: [companyId] });
  }
  private _companyId: string;

  teamForm = this.fb.group({
    name: ['', Validators.required]
  });

  teams$: Observable<Team[]>;
  count$ = this.teamService.count({}, { parents: [this.companyId] });

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService
  ) {}

  onSubmit() {
    this.teamService.add(this.teamForm.value, { parents: [this.companyId] }).subscribe(response => {
      console.log(response);
    });
    this.teamForm.reset();
  }

  delete(id: string) {
    this.teamService.delete(id, { parents: [this.companyId] });
  }
}
