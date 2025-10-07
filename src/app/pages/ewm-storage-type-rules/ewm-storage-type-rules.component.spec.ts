import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EwmStorageTypeRulesComponent } from './ewm-storage-type-rules.component';

describe('EwmStorageTypeRulesComponent', () => {
  let component: EwmStorageTypeRulesComponent;
  let fixture: ComponentFixture<EwmStorageTypeRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EwmStorageTypeRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EwmStorageTypeRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
