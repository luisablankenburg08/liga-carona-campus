import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Carona } from '../models/carona';
import { CaronaComponent } from '../components/carona/carona.component';
import { CaronaService } from '../services/caronaService';
import { AuthService } from '../services/authService';

@Component({
  selector: 'app-caronas-anteriores',
  templateUrl: './caronas-anteriores.page.html',
  styleUrls: ['./caronas-anteriores.page.scss'],
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, CaronaComponent]
})
export class CaronasAnterioresPage {

  private caronaService = inject(CaronaService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private navCtrl = inject(NavController);
  carregando = false;
  sincronizando = false;
  mensagemErro = '';

  get caronasAnteriores(): Carona[] {
    return this.caronaService.caronasAnteriores;
  }

  ionViewWillEnter(): void {
    void this.carregarCaronas();
  }

  async carregarCaronas(): Promise<void> {
    this.carregando = this.caronaService.caronas.length === 0;
    this.sincronizando = !this.carregando;
    try {
      await this.caronaService.carregarCaronas();
    } catch (erro: unknown) {
      this.mensagemErro = erro instanceof Error
        ? erro.message
        : 'Não foi possível carregar as caronas anteriores.';
    } finally {
      this.carregando = false;
      this.sincronizando = false;
    }
  }

  voltarParaCaronas(): void {
    void this.router.navigate(['/menu']);
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
