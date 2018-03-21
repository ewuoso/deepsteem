import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteemStatsComponent } from './steem-stats.component';

describe('SteemStatsComponent', () => {
  let component: SteemStatsComponent;
  let fixture: ComponentFixture<SteemStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteemStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteemStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
