import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  // Injeção moderna caso precise navegar via código no futuro
  private readonly router = inject(Router);

  // Exemplo de lógica que você pode adicionar para destacar o botão ativo
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
