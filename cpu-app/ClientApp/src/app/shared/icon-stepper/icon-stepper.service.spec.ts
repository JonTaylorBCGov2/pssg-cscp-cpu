import { TestBed } from '@angular/core/testing';

import { IconStepperService } from './icon-stepper.service';

describe('IconStepperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IconStepperService = TestBed.get(IconStepperService);
    expect(service).toBeTruthy();
  });
});
