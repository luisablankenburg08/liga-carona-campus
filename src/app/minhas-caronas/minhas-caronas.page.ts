import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { Router } from '@angular/router';
import { Carona } from '../models/carona';
import { CaronaComponent } from '../components/carona/carona.component';
import { CaronaService } from '../services/caronaService';
import { AuthService } from '../services/authService';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-minhas-caronas',
  templateUrl: './minhas-caronas.page.html',
  styleUrls: ['./minhas-caronas.page.scss'],
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, CaronaComponent]
})
export class MinhasCaronasPage {

  private caronaService = inject(CaronaService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private navCtrl = inject(NavController);
  carregando = false;
  sincronizando = false;
  mensagemErro = '';
  mensagemReserva = '';

  ionViewWillEnter(): void {
    this.mensagemReserva = this.caronaService.mensagemReserva ?? '';
    this.caronaService.mensagemReserva = null;
    void this.carregarCaronas();
  }

  get proximasCaronas(): Carona[] {
    return this.caronaService.proximasReservas;
  }

  get historicoCaronas(): Carona[] {
    return this.caronaService.historicoReservas;
  }

  async carregarCaronas(): Promise<void> {
    this.carregando = this.caronaService.caronas.length === 0;
    this.sincronizando = !this.carregando;
    try {
      await this.caronaService.carregarCaronas();
    } catch (erro: unknown) {
      this.mensagemErro = erro instanceof Error
        ? erro.message
        : 'Não foi possível carregar suas caronas.';
    } finally {
      this.carregando = false;
      this.sincronizando = false;
    }
  }

  async cancelarReserva(carona: Carona): Promise<void> {
    try {
      const cancelada = await this.caronaService.cancelarReserva(carona);
      if (!cancelada) {
        this.mensagemErro = 'Não foi possível cancelar esta reserva.';
        return;
      }
      this.mensagemReserva = 'Reserva cancelada. A vaga voltou a ficar disponível.';
    } catch (erro: unknown) {
      this.mensagemErro = erro instanceof Error
        ? erro.message
        : 'Não foi possível cancelar a reserva.';
    }
  }

  voltarParaCaronas(): void {
    void this.router.navigate(['/menu']);
  }

  abrirCaronasAnteriores(): void {
    void this.router.navigate(['/caronas-anteriores']);
  }

  async logout(): Promise<void> {
    try {
      await this.auth.sair();
      this.caronaService.invalidarCache();
      await this.navCtrl.navigateRoot('/login');
    } catch (erro: unknown) {
      this.mensagemErro = erro instanceof Error
        ? erro.message
        : 'Não foi possível encerrar a sessão.';
    }
  }
}
