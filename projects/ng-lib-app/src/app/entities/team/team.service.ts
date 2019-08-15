import { Injectable } from '@angular/core';
import { TeamState, TeamStore } from './team.store';
import { TeamQuery } from './team.query';
import { DnlFirestoreService } from '@dminine/ng-lib';
import { AngularFirestore } from '@angular/fire/firestore';
import { Team } from './types';

@Injectable({ providedIn: 'root' })
export class TeamService extends DnlFirestoreService<TeamState, Team> {
  constructor(
    protected teamStore: TeamStore,
    protected teamQuery: TeamQuery,
    protected afs: AngularFirestore
  ) {
    super(teamStore, teamQuery, afs, 'teams', ['companies']);
  }
}
