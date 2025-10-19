import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionVersionComponent } from './production-version.component';

describe('ProductionVersionComponent', () => {
  let component: ProductionVersionComponent;
  let fixture: ComponentFixture<ProductionVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionVersionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
