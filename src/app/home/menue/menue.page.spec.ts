import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuePage } from './menue.page';

describe('MenuePage', () => {
  let component: MenuePage;
  let fixture: ComponentFixture<MenuePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MenuePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
