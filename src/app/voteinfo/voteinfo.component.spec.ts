import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteinfoComponent } from './voteinfo.component';

describe('VoteinfoComponent', () => {
  let component: VoteinfoComponent;
  let fixture: ComponentFixture<VoteinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
