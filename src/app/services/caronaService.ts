import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { Carona } from '../models/carona';
import { db } from '../firebase.config';
import { AuthService } from './authService';
import type { User } from 'firebase/auth';

type ReservaFirestore = {
  caronaId: number;
  uid: string;
  status: 'reservada' | 'cancelada';
};

const caronasIniciais: Carona[] = [
  { id: 1, user: 1, vaga: 10, embarque: 'Centro', desembarque: 'IF', selecionado: false, hora: '08:00', data: '2026-11-01' },
  { id: 2, user: 1, vaga: 8, embarque: 'Bairro Norte', desembarque: 'IF', selecionado: false, hora: '09:00', data: '2026-11-02' },
  { id: 3, user: 1, vaga: 7, embarque: 'Shopping', desembarque: 'IF', selecionado: false, hora: '10:00', data: '2026-11-03' },
  { id: 4, user: 1, vaga: 15, embarque: 'IF', desembarque: 'Terminal', selecionado: false, hora: '11:00', data: '2026-11-04' },
  { id: 5, user: 1, vaga: 10, embarque: 'IF', desembarque: 'Centro', selecionado: false, hora: '12:00', data: '2026-11-05' },
  { id: 6, user: 1, vaga: 4, embarque: 'Centro', desembarque: 'IF', selecionado: false, hora: '07:30', data: '2026-10-30' },
  { id: 7, user: 1, vaga: 3, embarque: 'Terminal', desembarque: 'IF', selecionado: false, hora: '23:59', data: '2026-10-31' },
];

@Injectable({
  providedIn: 'root'
})
export class CaronaService {

  readonly caronas: Carona[] = caronasIniciais.map((carona) => ({ ...carona }));
  mensagemReserva: string | null = null;
  private authService = inject(AuthService);
  private carregadoParaUsuario: string | null = null;
  private ultimaSincronizacao = 0;
  private readonly validadeCacheMs = 30_000;
  private carregamentoEmAndamento: { usuarioId: string; promise: Promise<void> } | null = null;
  private cacheRestauradoParaUsuario: string | null = null;

  async carregarCaronas(): Promise<void> {
    const usuario = await this.authService.esperarUsuario();

    if (!usuario) {
      throw new Error('Sua sessão expirou. Entre novamente para acessar as caronas.');
    }

    this.restaurarCacheLocal(usuario);

    if (
      this.carregadoParaUsuario === usuario.uid
      && Date.now() - this.ultimaSincronizacao < this.validadeCacheMs
    ) {
      return;
    }

    if (this.carregamentoEmAndamento?.usuarioId === usuario.uid) {
      return this.carregamentoEmAndamento.promise;
    }

    const promise = this.buscarCaronas(usuario);
    this.carregamentoEmAndamento = { usuarioId: usuario.uid, promise };
    try {
      await promise;
      this.carregadoParaUsuario = usuario.uid;
      this.ultimaSincronizacao = Date.now();
    } finally {
      if (this.carregamentoEmAndamento?.promise === promise) {
        this.carregamentoEmAndamento = null;
      }
    }
  }

  private async buscarCaronas(usuario: User): Promise<void> {
    await this.criarCaronasIniciaisSeNecessario();

    const [snapshotCaronas, snapshotReservas] = await Promise.all([
      getDocs(collection(db, 'caronas')),
      getDocs(query(collection(db, 'reservas'), where('uid', '==', usuario.uid))),
    ]);

    const reservasAtivas = new Set(
      snapshotReservas.docs
        .map((reserva) => reserva.data() as ReservaFirestore)
        .filter((reserva) => reserva.status === 'reservada')
        .map((reserva) => reserva.caronaId)
    );

    const caronasCarregadas = snapshotCaronas.docs.map((documento) => {
      const dados = documento.data() as Omit<Carona, 'selecionado'>;
      return {
        ...dados,
        id: Number(documento.id),
        selecionado: reservasAtivas.has(Number(documento.id)),
      };
    }).sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora));

    this.caronas.splice(0, this.caronas.length, ...caronasCarregadas);
    this.salvarCacheLocal(usuario.uid);
  }

  invalidarCache(): void {
    this.carregadoParaUsuario = null;
    this.ultimaSincronizacao = 0;
    this.cacheRestauradoParaUsuario = null;
    this.caronas.splice(
      0,
      this.caronas.length,
      ...caronasIniciais.map((carona) => ({ ...carona }))
    );
  }

  private restaurarCacheLocal(usuario: User): void {
    if (this.cacheRestauradoParaUsuario === usuario.uid) {
      return;
    }

    this.cacheRestauradoParaUsuario = usuario.uid;
    const chave = `carona-campus:${usuario.uid}`;
    if (typeof localStorage === 'undefined') {
      return;
    }

    const dadosSalvos = localStorage.getItem(chave);
    if (!dadosSalvos) {
      return;
    }

    try {
      const caronasSalvas = JSON.parse(dadosSalvos) as Carona[];
      if (!Array.isArray(caronasSalvas) || !caronasSalvas.every((carona) =>
        typeof carona.id === 'number'
        && typeof carona.vaga === 'number'
        && typeof carona.selecionado === 'boolean'
        && typeof carona.data === 'string'
      )) {
        console.warn('O cache local de caronas tem formato inválido e será ignorado.');
        return;
      }

      this.caronas.splice(0, this.caronas.length, ...caronasSalvas);
    } catch (erro: unknown) {
      console.warn('Não foi possível ler o cache local de caronas.', erro);
    }
  }

  private salvarCacheLocal(usuarioId: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(`carona-campus:${usuarioId}`, JSON.stringify(this.caronas));
    } catch (erro: unknown) {
      console.error('Não foi possível salvar o cache local das caronas.', erro);
    }
  }

  async reservar(carona: Carona): Promise<boolean> {
    const usuarioId = await this.usuarioAtual();
    const referenciaCarona = doc(db, 'caronas', String(carona.id));
    const referenciaReserva = doc(db, 'reservas', `${usuarioId}_${carona.id}`);

    const resultado = await runTransaction(db, async (transacao) => {
      const [documentoCarona, documentoReserva] = await Promise.all([
        transacao.get(referenciaCarona),
        transacao.get(referenciaReserva),
      ]);

      if (!documentoCarona.exists()) {
        throw new Error('A carona não foi encontrada.');
      }

      const dadosCarona = documentoCarona.data() as Carona;
      const dadosReserva = documentoReserva.exists()
        ? documentoReserva.data() as ReservaFirestore
        : null;

      if (
        dadosCarona.vaga <= 0
        || dadosCarona.data < this.dataHoje()
        || dadosReserva?.status === 'reservada'
      ) {
        return { reservada: false, vagasRestantes: 0 };
      }

      transacao.update(referenciaCarona, { vaga: dadosCarona.vaga - 1 });
      transacao.set(referenciaReserva, {
        caronaId: carona.id,
        uid: usuarioId,
        status: 'reservada',
        dataReserva: new Date().toISOString(),
      });
      return { reservada: true, vagasRestantes: dadosCarona.vaga - 1 };
    });

    if (!resultado.reservada) {
      return false;
    }

    const caronaAtual = this.caronas.find((item) => item.id === carona.id);
    if (caronaAtual) {
      caronaAtual.vaga = resultado.vagasRestantes;
      caronaAtual.selecionado = true;
      this.mensagemReserva = `Vaga reservada — restante: ${caronaAtual.vaga}`;
      this.ultimaSincronizacao = Date.now();
      this.salvarCacheLocal(usuarioId);
    }
    return true;
  }

  async cancelarReserva(carona: Carona): Promise<boolean> {
    const usuarioId = await this.usuarioAtual();
    const referenciaCarona = doc(db, 'caronas', String(carona.id));
    const referenciaReserva = doc(db, 'reservas', `${usuarioId}_${carona.id}`);

    const resultado = await runTransaction(db, async (transacao) => {
      const [documentoCarona, documentoReserva] = await Promise.all([
        transacao.get(referenciaCarona),
        transacao.get(referenciaReserva),
      ]);

      if (!documentoCarona.exists() || !documentoReserva.exists()) {
        return { cancelada: false, vagasRestantes: 0 };
      }

      const dadosCarona = documentoCarona.data() as Carona;
      const dadosReserva = documentoReserva.data() as ReservaFirestore;

      if (
        dadosReserva.status !== 'reservada'
        || dadosCarona.data < this.dataHoje()
      ) {
        return { cancelada: false, vagasRestantes: 0 };
      }

      transacao.update(referenciaCarona, { vaga: dadosCarona.vaga + 1 });
      transacao.update(referenciaReserva, {
        status: 'cancelada',
        dataCancelamento: new Date().toISOString(),
      });
      return { cancelada: true, vagasRestantes: dadosCarona.vaga + 1 };
    });

    if (!resultado.cancelada) {
      return false;
    }

    const caronaAtual = this.caronas.find((item) => item.id === carona.id);
    if (caronaAtual) {
      caronaAtual.vaga = resultado.vagasRestantes;
      caronaAtual.selecionado = false;
      this.ultimaSincronizacao = Date.now();
      this.salvarCacheLocal(usuarioId);
    }
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

  private async criarCaronasIniciaisSeNecessario(): Promise<void> {
    const referenciaInicializacao = doc(db, 'configuracao', 'caronas-iniciais');

    await runTransaction(db, async (transacao) => {
      const inicializacao = await transacao.get(referenciaInicializacao);
      if (inicializacao.exists()) {
        return;
      }

      for (const carona of caronasIniciais) {
        transacao.set(doc(db, 'caronas', String(carona.id)), carona);
      }
      transacao.set(referenciaInicializacao, {
        inicializadaEm: new Date().toISOString(),
      });
    });
  }

  private async usuarioAtual(): Promise<string> {
    const usuario = await this.authService.esperarUsuario();
    if (!usuario) {
      throw new Error('Sua sessão expirou. Entre novamente para reservar ou cancelar.');
    }
    return usuario.uid;
  }

  private dataHoje(): string {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
