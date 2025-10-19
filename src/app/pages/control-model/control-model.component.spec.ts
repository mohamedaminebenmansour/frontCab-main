import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlModelComponent } from './control-model.component';

describe('ControlModelComponent', () => {
  let component: ControlModelComponent;
  let fixture: ComponentFixture<ControlModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
