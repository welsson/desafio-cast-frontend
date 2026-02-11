import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ContaService } from '../../services/conta.service';
import { ContaDTO } from '../../models/conta.model';
import { CurrencyMaskDirective } from '../../shared/directives/currency-mask';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CurrencyMaskDirective
  ],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss'
})
export class Usuario {
  private readonly service = inject(ContaService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly snConfig: MatSnackBarConfig = {
    duration: 4000,
    verticalPosition: 'top',
    horizontalPosition: 'center'
  };

  cpfBusca = signal<string>('');
  contaAtiva = signal<ContaDTO | null>(null);
  saldoInicialExtrato = signal<number>(0);
  saldoFinalExtrato = signal<number>(0);
  totalElementos = signal<number>(0);
  paginaAtual = signal<number>(0);
  itensPorPagina = signal<number>(5);

  valorOperacao = signal<number>(0);
  cpfDestinoBusca = signal<string>('');
  contaDestinoEncontrada = signal<ContaDTO | null>(null);
  carregando = signal(false);
  mensagemErroFavorecido = signal<string | null>(null);

  extrato = signal<any[]>([]);
  carregandoExtrato = signal(false);
  colunasExtrato = ['data', 'tipo', 'valor'];

  buscarPorCPF(): void {
    const cpf = this.cpfBusca().replace(/\D/g, '');
    if (cpf.length !== 11) {
      this.snackBar.open('CPF inválido. Digite 11 números.', 'Aviso', this.snConfig);
      return;
    }

    this.carregando.set(true);
    this.service.buscarPorCpf(cpf).subscribe({
      next: (res) => {
        this.contaAtiva.set(res);
        this.extrato.set([]);
        this.snackBar.open(`Bem-vindo, ${res.titular}!`, 'Sucesso', this.snConfig);
      },
      error: (err) => {
        const msg = err.error?.message || 'CPF não encontrado.';
        this.snackBar.open(msg, 'Erro', this.snConfig);
        this.contaAtiva.set(null);
      },
      complete: () => this.carregando.set(false)
    });
  }

  mudarPagina(event: PageEvent): void {
    this.itensPorPagina.set(event.pageSize);
    this.paginaAtual.set(event.pageIndex);
    this.emitirExtrato(event.pageIndex);
  }

  emitirExtrato(pagina: number = this.paginaAtual()): void {
    const id = this.contaAtiva()?.id;
    if (!id) return;

    this.carregandoExtrato.set(true);
    this.paginaAtual.set(pagina);

    this.service.buscarExtrato(id, pagina, this.itensPorPagina()).subscribe({
      next: (res: any) => {
        this.extrato.set(res.transacoes.content);
        this.totalElementos.set(res.transacoes.totalElements);
        this.saldoInicialExtrato.set(res.saldoInicial);
        this.saldoFinalExtrato.set(res.saldoFinal);
      },
      error: (err: any) => this.tratarErro(err),
      complete: () => this.carregandoExtrato.set(false)
    });
  }

  buscarFavorecidoPorCPF(): void {
    const cpf = this.cpfDestinoBusca().replace(/\D/g, '');
    this.mensagemErroFavorecido.set(null);

    if (cpf.length === 11) {
      this.service.buscarPorCpf(cpf).subscribe({
        next: (res) => {
          if (res.id === this.contaAtiva()?.id) {
            this.contaDestinoEncontrada.set(null);
            this.mensagemErroFavorecido.set('Você não pode transferir para o mesmo cpf.');
          } else {
            this.contaDestinoEncontrada.set(res);
            this.mensagemErroFavorecido.set(null);
          }
        },
        error: (err) => {
          this.contaDestinoEncontrada.set(null);
          const msg = err.error?.message || 'Favorecido não encontrado.';
          this.mensagemErroFavorecido.set(msg);
        }
      });
    } else {
      this.contaDestinoEncontrada.set(null);
      this.mensagemErroFavorecido.set(null);
    }
  }

  executarOperacao(tipo: 'CREDITO' | 'DEBITO' | 'TRANSFERENCIA'): void {
    const idOrigem = this.contaAtiva()?.id;
    const valor = this.valorOperacao();

    if (!idOrigem || valor <= 0) {
      this.snackBar.open('Informe um valor válido.', 'Aviso', this.snConfig);
      return;
    }

    if (tipo === 'TRANSFERENCIA' && !this.contaDestinoEncontrada()) {
      this.snackBar.open(this.mensagemErroFavorecido() || 'Favorecido inválido.', 'Erro', this.snConfig);
      return;
    }

    this.carregando.set(true);

    const operacaoObserver = {
      next: () => {
        const msg = tipo === 'TRANSFERENCIA' ? 'Transferência enviada!' :
                    tipo === 'CREDITO' ? 'Depósito realizado!' : 'Saque realizado!';
        this.snackBar.open(msg, 'Sucesso', this.snConfig);
        this.finalizarOperacao();
        this.carregando.set(false);
      },
      error: (err: any) => {
        this.tratarErro(err);
        this.carregando.set(false);
      }
    };

    if (tipo === 'TRANSFERENCIA') {
      this.service.transferir({
        origemId: idOrigem,
        destinoId: this.contaDestinoEncontrada()!.id,
        valor
      }).subscribe(operacaoObserver);
    } else {
      const payload = { contaId: idOrigem, valor };
      const acao$ = tipo === 'CREDITO' ? this.service.depositar(payload) : this.service.sacar(payload);
      acao$.subscribe(operacaoObserver);
    }
  }

  private finalizarOperacao(): void {
    this.atualizarSaldoAposOperacao();
    this.limparCamposOperacao();
    this.extrato.set([]);
  }

  private atualizarSaldoAposOperacao(): void {
    const cpf = this.contaAtiva()?.cpf;
    if (cpf) {
      this.service.buscarPorCpf(cpf).subscribe({
        next: (res) => this.contaAtiva.set(res),
        error: (err) => console.error('Erro ao atualizar saldo:', err)
      });
    }
  }

  private limparCamposOperacao(): void {
    this.valorOperacao.set(0);
    this.cpfDestinoBusca.set('');
    this.contaDestinoEncontrada.set(null);
    this.mensagemErroFavorecido.set(null);
  }

  private tratarErro(err: any): void {
    const msg = err.error?.message || 'Erro ao processar operação.';
    this.snackBar.open(msg, 'Entendido', this.snConfig);
  }

  sair(): void {
    this.contaAtiva.set(null);
    this.cpfBusca.set('');
    this.extrato.set([]);
    this.limparCamposOperacao();
  }
}
