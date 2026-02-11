import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContaDTO, PageResponseDTO, TransacaoDTO } from '../models/conta.model';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ContaService {
  private readonly http = inject(HttpClient); // Usando inject() padrão Angular 19
  private readonly API = `${environment.apiUrl}/v1/contas`;

  // --- ADMIN ---

  getTodasAsContas(page: number = 0, size: number = 10): Observable<PageResponseDTO<ContaDTO>> {
    return this.http.get<PageResponseDTO<ContaDTO>>(`${this.API}?page=${page}&size=${size}`);
  }

  criarConta(dados: { titular: string, cpf: string }): Observable<ContaDTO> {
    return this.http.post<ContaDTO>(this.API, dados);
  }

  // --- USUÁRIO ---

  buscarPorId(id: number): Observable<ContaDTO> {
    return this.http.get<ContaDTO>(`${this.API}/${id}`);
  }

  getExtrato(contaId: number, page: number = 0, size: number = 10): Observable<PageResponseDTO<TransacaoDTO>> {
    return this.http.get<PageResponseDTO<TransacaoDTO>>(`${this.API}/${contaId}/extrato?page=${page}&size=${size}`);
  }

  // Ajustado para passar o objeto OperacaoDTO { contaId, valor }
  depositar(operacao: { contaId: number, valor: number }): Observable<ContaDTO> {
    return this.http.post<ContaDTO>(`${this.API}/depositos`, operacao);
  }

  // Ajustado para passar o objeto OperacaoDTO { contaId, valor }
  sacar(operacao: { contaId: number, valor: number }): Observable<ContaDTO> {
    return this.http.post<ContaDTO>(`${this.API}/saques`, operacao);
  }

  // Novo método para Transferência { origemId, destinoId, valor }
  transferir(dados: { origemId: number, destinoId: number, valor: number }): Observable<void> {
    return this.http.post<void>(`${this.API}/transferencias`, dados);
  }

// No seu conta.service.ts no Angular, adicione:
buscarPorCpf(cpf: string): Observable<ContaDTO> {
  return this.http.get<ContaDTO>(`${this.API}/cpf/${cpf}`);
}

// conta.service.ts

// Ajuste o retorno para Observable<any> (pois o Page do Spring é um objeto)
buscarExtrato(contaId: number, page: number = 0, size: number = 5): Observable<any> {
  // O Spring espera os parâmetros: ?page=0&size=10&sort=dataHora,desc
  const params = `?page=${page}&size=${size}&sort=dataHora,desc`;
  return this.http.get<any>(`${this.API}/${contaId}/extrato${params}`);
}
}
