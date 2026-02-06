import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddAgentPage } from './add-agent.page';

describe('AddAgentPage', () => {
  let component: AddAgentPage;
  let fixture: ComponentFixture<AddAgentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAgentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
