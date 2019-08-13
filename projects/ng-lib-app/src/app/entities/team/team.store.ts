import { Injectable } from '@angular/core';
import { StoreConfig } from '@datorama/akita';
import { Team } from './types';
import { DnlFirestoreState, DnlFirestoreStore } from 'ng-lib';

export interface TeamState extends DnlFirestoreState<Team> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'team' })
export class TeamStore extends DnlFirestoreStore<TeamState, Team> {

  constructor() {
    super();
  }

}

