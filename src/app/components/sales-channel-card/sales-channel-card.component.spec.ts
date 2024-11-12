import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesChannelCardComponent } from './sales-channel-card.component';

describe('SalesChannelCardComponent', () => {
  let component: SalesChannelCardComponent;
  let fixture: ComponentFixture<SalesChannelCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesChannelCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesChannelCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
