import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly router = inject(Router);

  matricula = signal('');

  entrar() {
    const val = this.matricula().toLowerCase().trim();

    if (val === 'admin') {
      this.router.navigate(['/admin']);
    } else if (!isNaN(Number(val)) && val !== '') {
      // Se for número, assume que é o ID da conta do usuário
      this.router.navigate(['/usuario'], { queryParams: { id: val } });
    } else {
      alert('Matrícula inválida! Use "admin" ou o ID da sua conta.');
    }
  }
}
