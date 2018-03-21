import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoLinkComponent } from './promo-link.component';

describe('PromoLinkComponent', () => {
  let component: PromoLinkComponent;
  let fixture: ComponentFixture<PromoLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromoLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
