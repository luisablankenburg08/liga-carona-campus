import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaronaPage } from './carona.page';

describe('CaronaPage', () => {
  let component: CaronaPage;
  let fixture: ComponentFixture<CaronaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CaronaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
