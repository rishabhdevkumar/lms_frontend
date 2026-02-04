import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacultyProfilePage } from './faculty-profile.page';

describe('FacultyProfilePage', () => {
  let component: FacultyProfilePage;
  let fixture: ComponentFixture<FacultyProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FacultyProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
