import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonButton, IonCardContent, IonCardHeader, IonLabel, IonButtons, IonInput, IonText, IonIcon } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Carona} from '../../models/carona';
import { alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-carona',
  templateUrl: './carona.component.html',
  styleUrls: ['./carona.component.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonButton, IonCardContent, IonCardHeader, IonLabel, IonButtons, IonInput, IonText, IonIcon, CommonModule],
})
export class ProdutoComponent  implements OnInit {

  readonly alertCircleOutline = alertCircleOutline;

  @Input() 
  
  carona: Carona = { id: 0, user: 0, vaga: 0, embarque: '', desembarque: '', selecionado: false};

  constructor() { }

  async nasCaronas() {
    if (this.carona.selecionado === undefined || this.carona.selecionado === null) {
      this.carona.selecionado = false;
    }
  
  this.carona.selecionado = true;
}
  ngOnInit() {}

}
