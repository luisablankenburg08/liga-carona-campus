import {Injectable} from '@angular/core';  
import {Carona} from '../models/carona';

@Injectable({
  providedIn: 'root'
})
export class CaronaService {

    caronas: Carona[] = [
    {id: 1, user: 1, vaga: 10, embarque: "Centro", desembarque: 'IF', selecionado: false, hora: "08:00"},
    {id: 2, user: 1, vaga: 8, embarque: "Bairro Norte", desembarque: 'IF', selecionado: false, hora: "09:00"},
    {id: 3, user: 1, vaga: 7.00, embarque: "Shopping", desembarque: 'IF', selecionado: false, hora: "10:00"},
    {id: 4, user: 1, vaga: 15.00, embarque: "IF", desembarque: 'Terminal', selecionado: false, hora: "11:00"},
    {id: 5, user: 1, vaga: 10.00, embarque: "IF", desembarque: 'Centro', selecionado: false, hora: "12:00"},
    ]

}