import { TestBed } from '@angular/core/testing';
import { CaronaService } from './caronaService';

describe('CaronaService', () => {
  let service: CaronaService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [CaronaService],
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

  it('stores reservations locally and restores them when the ride list is loaded again', async () => {
    await service.carregarCaronas();
    const carona = service.caronas.find((item) => item.id === 1)!;
    const vagasIniciais = carona.vaga;

    expect(await service.reservar(carona)).toBe(true);
    expect(service.caronas.find((item) => item.id === carona.id)).toMatchObject({
      vaga: vagasIniciais - 1,
      selecionado: true,
    });

    service.invalidarCache();
    await service.carregarCaronas();

    const caronaRestaurada = service.caronas.find((item) => item.id === 1)!;
    expect(caronaRestaurada.vaga).toBe(vagasIniciais - 1);
    expect(caronaRestaurada.selecionado).toBe(true);
  });

  it('keeps the initial rides visible when a previous empty cache exists', async () => {
    localStorage.setItem('carona-campus:local', '[]');

    await service.carregarCaronas();

    expect(service.caronas).toHaveLength(7);
    expect(service.caronasDisponiveis.length).toBeGreaterThan(0);
  });

  it('restores rides saved by the previous account-scoped cache', async () => {
    const caronaSalva = { ...service.caronas[0], vaga: 2, selecionado: true };
    localStorage.setItem('carona-campus:previous-user', JSON.stringify([caronaSalva]));

    await service.carregarCaronas();

    expect(service.caronas).toHaveLength(7);
    expect(service.caronas.find((carona) => carona.id === caronaSalva.id)).toMatchObject({
      vaga: 2,
      selecionado: true,
    });
    expect(localStorage.getItem('carona-campus:local')).not.toBeNull();
  });

  it('restores a canceled seat to the local ride list', async () => {
    await service.carregarCaronas();
    const carona = service.caronas.find((item) => item.id === 1)!;

    expect(await service.reservar(carona)).toBe(true);
    expect(await service.cancelarReserva(carona)).toBe(true);
    expect(carona.vaga).toBe(10);
    expect(carona.selecionado).toBe(false);
  });

  it('allows a ride reservation without any Firebase authentication dependency', async () => {
    await service.carregarCaronas();
    const carona = service.caronas.find((item) => item.id === 1)!;

    await expect(service.reservar(carona)).resolves.toBe(true);
  });
});
