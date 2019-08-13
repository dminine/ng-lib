import { Injectable } from '@angular/core';
import { TeamStore, TeamState } from './team.store';
import { Team } from './types';
import { DnlFirestoreQuery } from 'ng-lib';

@Injectable({ providedIn: 'root' })
export class TeamQuery extends DnlFirestoreQuery<TeamState, Team> {

  constructor(protected store: TeamStore) {
    super(store);
  }
}
