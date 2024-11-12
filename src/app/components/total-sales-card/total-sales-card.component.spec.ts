import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSalesCardComponent } from './total-sales-card.component';

describe('TotalSalesCardComponent', () => {
  let component: TotalSalesCardComponent;
  let fixture: ComponentFixture<TotalSalesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalSalesCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalSalesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
