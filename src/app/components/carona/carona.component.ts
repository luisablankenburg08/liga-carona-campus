import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonCard, IonButton, IonCardContent, IonCardTitle } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Carona } from '../../models/carona';

@Component({
  selector: 'app-carona',
  templateUrl: './carona.component.html',
  styleUrls: ['./carona.component.scss'],
  imports: [IonCard, IonButton, IonCardContent, IonCardTitle, CommonModule],
})
export class CaronaComponent {

  @Input() carona: Carona = {
    id: 0,
    user: 0,
    vaga: 0,
    embarque: '',
    desembarque: '',
    hora: '',
    data: '',
    selecionado: false,
  };
  @Input() modo: 'disponivel' | 'reservada' | 'historico' = 'disponivel';

  @Output() adicionar = new EventEmitter<Carona>();
  @Output() reservaCancelada = new EventEmitter<Carona>();
}
