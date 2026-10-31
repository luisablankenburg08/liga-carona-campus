import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular';
import { Carona } from '../models/carona';
import { CaronaService } from '../services/caronaService';
import { CaronaComponent } from '../components/carona/carona.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/authService';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, CaronaComponent, IonButton, IonButtons]
})
export class MenuPage {

  somenteHoje = false;
  carregando = false;
  sincronizando = false;
  mensagemErro = '';

  get listacaronas(): Carona[] {
    return this.somenteHoje
      ? this.caronaService.caronasDeHoje
      : this.caronaService.caronasDisponiveis;
  }

  public auth = inject(AuthService);
  private caronaService = inject(CaronaService);
  private router = inject(Router);
  private navCtrl = inject(NavController);

  ionViewWillEnter(): void {
    void this.carregarCaronas();
  }

  async carregarCaronas(): Promise<void> {
    this.carregando = this.caronaService.caronas.length === 0;
    this.sincronizando = !this.carregando;
    this.mensagemErro = '';
    try {
      await this.caronaService.carregarCaronas();
    } catch (erro: unknown) {
      this.mensagemErro = erro instanceof Error
        ? erro.message
        : 'Não foi possível carregar as caronas.';
    } finally {
      this.carregando = false;
      this.sincronizando = false;
    }
  }

  async adicionarCarona(carona: Carona): Promise<void> {
    try {
      await this.caronaService.carregarCaronas();
      if (await this.caronaService.reservar(carona)) {
        await this.router.navigate(['/minhas-caronas']);
      } else {
        await this.carregarCaronas();
        if (!this.mensagemErro) {
          this.mensagemErro = 'A carona não está mais disponível para reserva.';
        }
      }
    } catch (erro: unknown) {
      this.mensagemErro = erro instanceof Error
        ? erro.message
        : 'Não foi possível reservar a carona.';
    }
  }

  alternarFiltro(): void {
    this.somenteHoje = !this.somenteHoje;
  }

  abrirMinhasCaronas(): void {
    void this.router.navigate(['/minhas-caronas']);
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
