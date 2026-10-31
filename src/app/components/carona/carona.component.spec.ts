import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaronaComponent } from './carona.component';

describe('CaronaComponent', () => {
  let component: CaronaComponent;
  let fixture: ComponentFixture<CaronaComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CaronaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the selected ride when adding it', () => {
    const carona = {
      id: 1,
      user: 1,
      vaga: 1,
      embarque: 'Centro',
      desembarque: 'IF',
      hora: '08:00',
      data: '2026-11-01',
      selecionado: false,
    };
    const emitSpy = vi.spyOn(component.adicionar, 'emit');

    fixture.componentRef.setInput('carona', carona);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('ion-button').click();

    expect(emitSpy).toHaveBeenCalledWith(carona);
  });

  it('should show a distinct message when only one seat remains', () => {
    fixture.componentRef.setInput('carona', {
      id: 1,
      user: 1,
      vaga: 1,
      embarque: 'Centro',
      desembarque: 'IF',
      hora: '08:00',
      data: '2026-11-01',
      selecionado: false,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Apenas 1 vaga restante');
  });

  it('should show sold out and disable adding when no seats remain', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Esgotado');
    expect(fixture.nativeElement.querySelector('ion-button').disabled).toBe(true);
  });

  it('should emit the reserved ride when canceling it', () => {
    const carona = {
      id: 1,
      user: 1,
      vaga: 9,
      embarque: 'Centro',
      desembarque: 'IF',
      hora: '08:00',
      data: '2026-11-01',
      selecionado: true,
    };
    const emitSpy = vi.spyOn(component.reservaCancelada, 'emit');

    fixture.componentRef.setInput('carona', carona);
    fixture.componentRef.setInput('modo', 'reservada');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('ion-button').click();

    expect(emitSpy).toHaveBeenCalledWith(carona);
  });
});
