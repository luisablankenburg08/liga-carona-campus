import { Injectable } from '@angular/core';
import { Carona } from '../models/carona';

const chaveCaronasLocais = 'carona-campus:local';

const caronasIniciais: Carona[] = [
  { id: 1, user: 1, vaga: 10, embarque: 'Centro', desembarque: 'IF', selecionado: false, hora: '08:00', data: '2026-11-30' },
  { id: 2, user: 1, vaga: 8, embarque: 'Bairro Norte', desembarque: 'IF', selecionado: false, hora: '09:00', data: '2026-11-29' },
  { id: 3, user: 1, vaga: 7, embarque: 'Shopping', desembarque: 'IF', selecionado: false, hora: '10:00', data: '2026-11-28' },
  { id: 4, user: 1, vaga: 15, embarque: 'IF', desembarque: 'Terminal', selecionado: false, hora: '11:00', data: '2026-11-20' },
  { id: 5, user: 1, vaga: 10, embarque: 'IF', desembarque: 'Centro', selecionado: false, hora: '12:00', data: '2026-11-26' },
  { id: 6, user: 1, vaga: 4, embarque: 'Centro', desembarque: 'IF', selecionado: false, hora: '07:30', data: '2026-10-30' },
  { id: 7, user: 1, vaga: 3, embarque: 'Terminal', desembarque: 'IF', selecionado: false, hora: '23:59', data: '2026-10-31' },
];

function caronaValida(valor: unknown): valor is Carona {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }

  const carona = valor as Partial<Carona>;
  return typeof carona.id === 'number'
    && typeof carona.user === 'number'
    && typeof carona.vaga === 'number'
    && typeof carona.embarque === 'string'
    && typeof carona.desembarque === 'string'
    && typeof carona.hora === 'string'
    && typeof carona.data === 'string'
    && typeof carona.selecionado === 'boolean';
}

@Injectable({
  providedIn: 'root'
})
export class CaronaService {
  readonly caronas: Carona[] = caronasIniciais.map((carona) => ({ ...carona }));
  mensagemReserva: string | null = null;

  async carregarCaronas(): Promise<void> {
    this.restaurarCaronasLocais();
  }

  invalidarCache(): void {
    this.restaurarCaronasLocais();
  }

  async reservar(carona: Carona): Promise<boolean> {
    await this.carregarCaronas();
    const caronaAtual = this.caronas.find((item) => item.id === carona.id);

    if (
      !caronaAtual
      || caronaAtual.vaga <= 0
      || caronaAtual.data < this.dataHoje()
      || caronaAtual.selecionado
    ) {
      return false;
    }

    caronaAtual.vaga -= 1;
    caronaAtual.selecionado = true;
    this.mensagemReserva = `Vaga reservada — restante: ${caronaAtual.vaga}`;
    this.salvarCaronasLocais();
    return true;
  }

  async cancelarReserva(carona: Carona): Promise<boolean> {
    await this.carregarCaronas();
    const caronaAtual = this.caronas.find((item) => item.id === carona.id);

    if (
      !caronaAtual
      || !caronaAtual.selecionado
      || caronaAtual.data < this.dataHoje()
    ) {
      return false;
    }

    caronaAtual.vaga += 1;
    caronaAtual.selecionado = false;
    this.salvarCaronasLocais();
    return true;
  }

  get proximasReservas(): Carona[] {
    return this.caronas.filter(
      (carona) => carona.selecionado && carona.data >= this.dataHoje()
    );
  }

  get caronasDisponiveis(): Carona[] {
    return this.caronas.filter((carona) => carona.data >= this.dataHoje());
  }

  get caronasDeHoje(): Carona[] {
    const hoje = this.dataHoje();
    const horaAtual = new Date().toTimeString().slice(0, 5);
    return this.caronas.filter(
      (carona) => carona.data === hoje && carona.hora >= horaAtual && carona.vaga > 0
    );
  }

  get caronasAnteriores(): Carona[] {
    return this.caronas.filter((carona) => carona.data < this.dataHoje());
  }

  get historicoReservas(): Carona[] {
    return this.caronas.filter(
      (carona) => carona.selecionado && carona.data < this.dataHoje()
    );
  }

  private restaurarCaronasLocais(): void {
    const iniciais = caronasIniciais
      .map((carona) => ({ ...carona }))
      .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora));
    this.caronas.splice(0, this.caronas.length, ...iniciais);

    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const dadosSalvos = this.lerCaronasSalvas();
      if (!dadosSalvos) {
        this.salvarCaronasLocais();
        return;
      }

      const caronasPorId = new Map(
        this.caronas.map((carona) => [carona.id, carona])
      );
      dadosSalvos.forEach((carona) => caronasPorId.set(carona.id, carona));
      this.caronas.splice(
        0,
        this.caronas.length,
        ...[...caronasPorId.values()].sort(
          (a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora)
        )
      );
      this.salvarCaronasLocais();
    } catch (erro: unknown) {
      console.warn('Não foi possível ler o cache local de caronas.', erro);
      this.salvarCaronasLocais();
    }
  }

  private lerCaronasSalvas(): Carona[] | null {
    const cacheAtual = localStorage.getItem(chaveCaronasLocais);
    if (cacheAtual) {
      return this.validarCaronasSalvas(cacheAtual);
    }

    const cacheLegado: Carona[] = [];
    for (let indice = 0; indice < localStorage.length; indice += 1) {
      const chave = localStorage.key(indice);
      if (!chave?.startsWith('carona-campus:')) {
        continue;
      }

      const dados = localStorage.getItem(chave);
      if (dados) {
        cacheLegado.push(...(this.validarCaronasSalvas(dados) ?? []));
      }
    }

    return cacheLegado.length > 0 ? cacheLegado : null;
  }

  private validarCaronasSalvas(dados: string): Carona[] | null {
    try {
      const caronasSalvas: unknown = JSON.parse(dados);
      if (Array.isArray(caronasSalvas) && caronasSalvas.every(caronaValida)) {
        return caronasSalvas;
      }
    } catch (erro: unknown) {
      console.warn('Não foi possível ler o cache local de caronas.', erro);
    }

    console.warn('O cache local de caronas tem formato inválido e será ignorado.');
    return null;
  }

  private salvarCaronasLocais(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(chaveCaronasLocais, JSON.stringify(this.caronas));
    } catch (erro: unknown) {
      console.error('Não foi possível salvar as caronas neste dispositivo.', erro);
    }
  }

  private dataHoje(): string {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
