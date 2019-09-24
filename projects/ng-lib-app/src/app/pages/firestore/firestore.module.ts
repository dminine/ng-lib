import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DnlSharedModule } from 'ng-lib';
import { FirestoreRoutingModule } from './firestore-routing.module';
import { FirestorePageComponent } from './components/firestore-page/firestore-page.component';
import { TeamComponent } from './components/team/team.component';

@NgModule({
  declarations: [FirestorePageComponent, TeamComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FirestoreRoutingModule,
    DnlSharedModule
  ]
})
export class FirestorePageModule { }
