import { TestBed } from '@angular/core/testing';

import { GlobalFieldService } from './global-field.service';

describe('GlobalFieldService', () => {
  let service: GlobalFieldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalFieldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
