import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FirestoreRoutingModule } from './firestore-routing.module';
import { FirestorePageComponent } from './components/firestore-page/firestore-page.component';

@NgModule({
  declarations: [FirestorePageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FirestoreRoutingModule
  ]
})
export class FirestorePageModule { }
