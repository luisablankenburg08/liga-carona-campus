import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonButton, IonButtons, IonText} from '@ionic/angular';
import { Carona } from '../models/carona';
import { CaronaService } from '../services/caronaService';
import {CaronaComponent} from '../components/carona/carona.component';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/authService';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-minhas-caronas',
  templateUrl: './minhas-caronas.page.html',
  styleUrls: ['./minhas-caronas.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonButtons, IonButton, IonText, CaronaComponent, RouterLink]
})
export class MinhasCaronasPage implements OnInit {

  listacaronas: Carona[] = [];

  constructor(
    public auth: AuthService,
    private caronaService: CaronaService,
    private router: Router,
    private navCtrl: NavController) { 
      this.listacaronas = this.caronaService.caronas;
  }
  

  ngOnInit() {
  }

  logout() {
    localStorage.clear(); 
    sessionStorage.clear();
    this.navCtrl.navigateRoot('/login');
  }

}
