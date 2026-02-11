import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroupDirective, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ContaService } from '../../services/conta.service';
import { ContaDTO, PageResponseDTO } from '../../models/conta.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CpfPipe } from '../../shared/cpf.pipe';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatSnackBarModule,
    CpfPipe
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ContaService);
  private readonly snackBar = inject(MatSnackBar);

  totalElements = signal(0);
  pageSize = signal(10);
  paginaAtual = signal(0);

  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  carregando = signal<boolean>(false);

  displayedColumns: string[] = ['id', 'numero', 'titular', 'cpf', 'saldo'];

  protected readonly formConta = this.fb.group({
    titular: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
  });

  ngOnInit(): void {
    this.listarContas();
  }

  contas = signal<ContaDTO[]>([]);

  listarContas(): void {
  this.carregando.set(true);

  this.service.getTodasAsContas(this.paginaAtual(), this.pageSize()).subscribe({
    next: (res: PageResponseDTO<ContaDTO>) => {
      if (res && res.content) {
        this.contas.set(res.content);
        this.totalElements.set(res.totalElements);
      }
    },
    error: (err) => {
      this.snackBar.open(err.error?.message || 'Erro ao carregar lista', 'Fechar');
    },
    complete: () => this.carregando.set(false)
  });
}

mudarPagina(event: PageEvent) {
  this.paginaAtual.set(event.pageIndex);
  this.pageSize.set(event.pageSize);
  this.listarContas();
}

 criarConta(): void {
    if (this.formConta.invalid) return;

    const payload = this.formConta.getRawValue();

    this.service.criarConta(payload).subscribe({
      next: (res: ContaDTO) => {
        this.snackBar.open(`Conta criada com sucesso!`, 'Fechar', { duration: 5000 });

        this.formConta.reset();
        if (this.formDirective) {
          this.formDirective.resetForm();
        }

        this.listarContas();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao criar conta', 'Fechar');
      }
    });
  }
}
