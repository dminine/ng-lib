import { TestBed } from '@angular/core/testing';

import { NgLibService } from './ng-lib.service';

describe('NgLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgLibService = TestBed.get(NgLibService);
    expect(service).toBeTruthy();
  });
});
