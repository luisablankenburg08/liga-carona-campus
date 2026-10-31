import { TestBed } from '@angular/core/testing';
import { AuthService } from './authService';
import { CaronaService } from './caronaService';

describe('CaronaService', () => {
  let service: CaronaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CaronaService,
        {
          provide: AuthService,
          useValue: { usuario: null, esperarUsuario: vi.fn() },
        },
      ],
    });
    service = TestBed.inject(CaronaService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('includes only reserved, completed rides in reservation history', () => {
    service.caronas.splice(0, service.caronas.length);
    const reservedPastRide = {
      id: 1,
      user: 1,
      vaga: 4,
      embarque: 'Centro',
      desembarque: 'IF',
      hora: '08:00',
      data: '2000-01-01',
      selecionado: true,
    };
    const unreservedPastRide = { ...reservedPastRide, id: 2, selecionado: false, data: '2000-01-02' };
    service.caronas.push(reservedPastRide, unreservedPastRide);

    expect(service.historicoReservas).toEqual([reservedPastRide]);
  });

  it('includes every past ride in the previous rides list, whether reserved or not', () => {
    service.caronas.splice(0, service.caronas.length);
    const reservedPastRide = {
      id: 1,
      user: 1,
      vaga: 4,
      embarque: 'Centro',
      desembarque: 'IF',
      hora: '08:00',
      data: '2000-01-01',
      selecionado: true,
    };
    const unreservedPastRide = { ...reservedPastRide, id: 2, selecionado: false, data: '2000-01-02' };
    service.caronas.push(reservedPastRide, unreservedPastRide);

    expect(service.caronasAnteriores).toEqual([
      reservedPastRide,
      unreservedPastRide,
    ]);
  });

  it('filters the current-day board to rides that have not left and still have seats', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 31, 8, 30));
    service.caronas.push(
      { id: 8, user: 1, vaga: 2, embarque: 'Centro', desembarque: 'IF', selecionado: false, hora: '09:00', data: '2026-10-31' },
      { id: 9, user: 1, vaga: 2, embarque: 'Centro', desembarque: 'IF', selecionado: false, hora: '08:00', data: '2026-10-31' },
      { id: 10, user: 1, vaga: 0, embarque: 'Centro', desembarque: 'IF', selecionado: false, hora: '10:00', data: '2026-10-31' },
      { id: 11, user: 1, vaga: 2, embarque: 'Centro', desembarque: 'IF', selecionado: false, hora: '09:00', data: '2026-11-01' },
    );

    expect(service.caronasDeHoje.map((carona) => carona.id)).toEqual([7, 8]);
  });
});
