import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, IonButton } from '@ionic/angular';
import { Carona } from '../models/carona';
import { CaronaService } from '../services/caronaService';
import {CaronaComponent} from '../components/carona/carona.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/authService';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, CaronaComponent, IonButton, IonButtons, IonIcon]
})
export class MenuPage  {

  listacaronas: Carona[] = [];

  constructor( 
    public auth: AuthService,
    private caronaService: CaronaService,
    private router: Router,
    private navCtrl: NavController) { 
      this.listacaronas = this.caronaService.caronas;
  }


  logout() {
    localStorage.clear(); 
    sessionStorage.clear();
    this.navCtrl.navigateRoot('/login');
  }

  ngOnInit() {
  }

}
