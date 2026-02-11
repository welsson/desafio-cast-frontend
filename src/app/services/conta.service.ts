import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContaDTO, PageResponseDTO, TransacaoDTO } from '../models/conta.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContaService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/v1/contas`;

  getTodasAsContas(page: number = 0, size: number = 10): Observable<PageResponseDTO<ContaDTO>> {
    return this.http.get<PageResponseDTO<ContaDTO>>(`${this.API}?page=${page}&size=${size}`);
  }

  criarConta(dados: { titular: string, cpf: string }): Observable<ContaDTO> {
    return this.http.post<ContaDTO>(this.API, dados);
  }

  buscarPorId(id: number): Observable<ContaDTO> {
    return this.http.get<ContaDTO>(`${this.API}/${id}`);
  }

  getExtrato(contaId: number, page: number = 0, size: number = 10): Observable<PageResponseDTO<TransacaoDTO>> {
    return this.http.get<PageResponseDTO<TransacaoDTO>>(`${this.API}/${contaId}/extrato?page=${page}&size=${size}`);
  }

  depositar(operacao: { contaId: number, valor: number }): Observable<ContaDTO> {
    return this.http.post<ContaDTO>(`${this.API}/depositos`, operacao);
  }

  sacar(operacao: { contaId: number, valor: number }): Observable<ContaDTO> {
    return this.http.post<ContaDTO>(`${this.API}/saques`, operacao);
  }

  transferir(dados: { origemId: number, destinoId: number, valor: number }): Observable<void> {
    return this.http.post<void>(`${this.API}/transferencias`, dados);
  }

  buscarPorCpf(cpf: string): Observable<ContaDTO> {
    return this.http.get<ContaDTO>(`${this.API}/cpf/${cpf}`);
  }

  buscarExtrato(contaId: number, page: number = 0, size: number = 5): Observable<any> {
    const params = `?page=${page}&size=${size}&sort=dataHora,desc`;
    return this.http.get<any>(`${this.API}/${contaId}/extrato${params}`);
  }
}
