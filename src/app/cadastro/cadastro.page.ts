import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonButton, IonCardContent, IonCardHeader, IonLabel, IonButtons, IonInput} from '@ionic/angular';
import { AuthService } from '../services/authService';
import { IonItem } from '@ionic/angular';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonButton, IonCardContent, IonCardHeader, IonLabel, IonButtons, IonItem, IonInput, CommonModule, FormsModule, RouterModule],
})
export class CadastroPage {

  email = '';
  senha = '';
  mensagemErro = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  async cadastrar() {
    this.mensagemErro = '';

    if (!this.email || !this.senha) {
      this.mensagemErro = 'Preencha e-mail e senha.';
      return;
    }

    if (!this.email.includes('@')) {
      this.mensagemErro = 'Digite um e-mail válido.';
      return;
    }

    if (this.senha.length < 6) {
      this.mensagemErro = 'A senha precisa ter pelo menos 6 caracteres.';
      return;
    }

    try {
      await this.auth.cadastrar(this.email, this.senha);
      await this.router.navigate(['/menu']);
    } catch (erro: unknown) {
      const codigo = erro instanceof Error && 'code' in erro
        ? String(erro.code)
        : 'auth/unknown';
      this.mensagemErro = this.auth.traduzirErro(codigo);
    }
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }

}