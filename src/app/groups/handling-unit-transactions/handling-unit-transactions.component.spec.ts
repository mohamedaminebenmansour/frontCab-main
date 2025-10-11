import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlingUnitTransactionsComponent } from './handling-unit-transactions.component';

describe('HandlingUnitTransactionsComponent', () => {
  let component: HandlingUnitTransactionsComponent;
  let fixture: ComponentFixture<HandlingUnitTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandlingUnitTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandlingUnitTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
