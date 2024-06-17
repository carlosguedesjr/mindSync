import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewNeuroComponent } from './new-neuro.component';

describe('NewNeuroComponent', () => {
  let component: NewNeuroComponent;
  let fixture: ComponentFixture<NewNeuroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewNeuroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewNeuroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
