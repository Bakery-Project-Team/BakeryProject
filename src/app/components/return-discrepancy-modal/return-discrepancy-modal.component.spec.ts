import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReturnDiscrepancyModalComponent } from './return-discrepancy-modal.component';

describe('ReturnDiscrepancyModalComponent', () => {
  let component: ReturnDiscrepancyModalComponent;
  let fixture: ComponentFixture<ReturnDiscrepancyModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReturnDiscrepancyModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnDiscrepancyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
