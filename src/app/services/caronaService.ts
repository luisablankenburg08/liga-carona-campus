import {Injectable} from '@angular/core';  
import {Carona} from '../models/carona';

@Injectable({
  providedIn: 'root'
})
export class CaronaService {

    produtos: Carona[] = [
    {id: 1, user: 1, vaga: 10, embarque: "", desembarque: 'Lanche', selecionado: false},
    {id: 2, user: 1, vaga: 8, embarque: "0", desembarque: 'Doce', selecionado: false},
    {id: 3, user: 1, vaga: 7.00, embarque: "8", desembarque: 'Lanche', selecionado: false},
    {id: 4, user: 1, vaga: 15.00, embarque: "2", desembarque: 'Porção', selecionado: false},
    {id: 5, user: 1, vaga: 10.00, embarque: "15", desembarque: 'Doce', selecionado: false},
    ]

}