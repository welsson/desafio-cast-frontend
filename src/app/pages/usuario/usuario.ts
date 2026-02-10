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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ContaService } from '../../services/conta';
import { ContaDTO } from '../../models/conta.model';
import { CurrencyMaskDirective } from '../../shared/directives/currency-mask';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

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


  // --- Estados do Usuário Logado ---
  cpfBusca = signal<string>('');
  contaAtiva = signal<ContaDTO | null>(null);
  saldoInicialExtrato = signal<number>(0);
  saldoFinalExtrato = signal<number>(0);
  totalElementos = signal<number>(0);
  paginaAtual = signal<number>(0);
  itensPorPagina = signal<number>(5);


  // --- Estados de Operação ---
  valorOperacao = signal<number>(0);
  cpfDestinoBusca = signal<string>('');
  contaDestinoEncontrada = signal<ContaDTO | null>(null);
  carregando = signal(false);

  // --- Estados do Extrato ---
  extrato = signal<any[]>([]);
  carregandoExtrato = signal(false);
  colunasExtrato = ['data', 'tipo', 'valor'];

  buscarPorCPF(): void {
    const cpf = this.cpfBusca().replace(/\D/g, '');
    if (cpf.length !== 11) {
      this.snackBar.open('CPF inválido. Digite 11 números.', 'Aviso');
      return;
    }

    this.carregando.set(true);
    this.service.buscarPorCpf(cpf).subscribe({
      next: (res) => {
        this.contaAtiva.set(res);
        this.extrato.set([]); // Limpa extrato ao trocar de conta
        this.snackBar.open(`Bem-vindo, ${res.titular}!`, 'Sucesso', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('CPF não encontrado no Cast Bank.', 'Erro');
        this.contaAtiva.set(null);
      },
      complete: () => this.carregando.set(false)
    });
  }

  /**
   * Busca o extrato manualmente por clique no botão
   */
/**
   * Ajuste no método emitirExtrato para aceitar a página
   */
 mudarPagina(event: PageEvent): void {
  // Primeiro atualizamos os estados
  this.itensPorPagina.set(event.pageSize);
  this.paginaAtual.set(event.pageIndex);

  // Depois chamamos a busca passando o novo index
  this.emitirExtrato(event.pageIndex);
}

emitirExtrato(pagina: number = this.paginaAtual()): void {
  const id = this.contaAtiva()?.id;
  if (!id) return;

  this.carregandoExtrato.set(true);
  // Não resete para 0 aqui a menos que o usuário clique no botão "Emitir Extrato" manualmente
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
    if (cpf.length === 11) {
      this.service.buscarPorCpf(cpf).subscribe({
        next: (res) => {
          if (res.id === this.contaAtiva()?.id) {
            this.contaDestinoEncontrada.set(null);
            this.snackBar.open('Você não pode transferir para si mesmo.', 'Aviso');
          } else {
            this.contaDestinoEncontrada.set(res);
          }
        },
        error: () => this.contaDestinoEncontrada.set(null)
      });
    } else {
      this.contaDestinoEncontrada.set(null);
    }
  }

  executarOperacao(tipo: 'CREDITO' | 'DEBITO' | 'TRANSFERENCIA'): void {
    const idOrigem = this.contaAtiva()?.id;
    const valor = this.valorOperacao();

    if (!idOrigem || valor <= 0) {
      this.snackBar.open('Informe um valor válido.', 'Aviso');
      return;
    }

    this.carregando.set(true);

    if (tipo === 'TRANSFERENCIA') {
      const idDestino = this.contaDestinoEncontrada()?.id;
      if (!idDestino) {
        this.snackBar.open('Favorecido inválido.', 'Erro');
        this.carregando.set(false);
        return;
      }

      this.service.transferir({ origemId: idOrigem, destinoId: idDestino, valor }).subscribe({
        next: () => {
          this.snackBar.open('Transferência enviada com sucesso!', 'Sucesso');
          this.finalizarOperacao();
        },
        error: (err) => this.tratarErro(err),
        complete: () => this.carregando.set(false)
      });
    } else {
      const payload = { contaId: idOrigem, valor };
      const acao$ = tipo === 'CREDITO' ? this.service.depositar(payload) : this.service.sacar(payload);

      acao$.subscribe({
        next: () => {
          this.snackBar.open(`${tipo === 'CREDITO' ? 'Depósito' : 'Saque'} realizado!`, 'Sucesso');
          this.finalizarOperacao();
        },
        error: (err) => this.tratarErro(err),
        complete: () => this.carregando.set(false)
      });
    }
  }

  private finalizarOperacao(): void {
    this.atualizarSaldoAposOperacao();
    this.limparCamposOperacao();
    this.extrato.set([]); // Reseta extrato para exigir nova emissão com dados novos
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
  }

  private tratarErro(err: any): void {
    const msg = err.error?.message || 'Erro ao processar operação.';
    this.snackBar.open(msg, 'Entendido');
  }

  sair(): void {
    this.contaAtiva.set(null);
    this.cpfBusca.set('');
    this.extrato.set([]);
    this.limparCamposOperacao();
  }
}
