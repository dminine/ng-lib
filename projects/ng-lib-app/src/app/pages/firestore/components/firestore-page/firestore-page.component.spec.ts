import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirestorePageComponent } from './firestore-page.component';

describe('FirestorePageComponent', () => {
  let component: FirestorePageComponent;
  let fixture: ComponentFixture<FirestorePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirestorePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirestorePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
