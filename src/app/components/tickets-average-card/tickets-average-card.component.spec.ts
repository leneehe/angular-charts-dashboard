import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsAverageCardComponent } from './tickets-average-card.component';

describe('TicketsAverageCardComponent', () => {
  let component: TicketsAverageCardComponent;
  let fixture: ComponentFixture<TicketsAverageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketsAverageCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketsAverageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
