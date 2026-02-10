import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatRippleModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly router = inject(Router);

  navegar(perfil: string) {
    if (perfil === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/usuario']);
    }
  }
}
