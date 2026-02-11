export interface ContaDTO {
  id: number;
  numero: string;
  titular: string;
  cpf: string;
  saldo: number;
}

export interface TransacaoDTO {
  id: number;
  tipo: string; // 'CREDITO' | 'DEBITO' | 'TRANSFERENCIA'
  valor: number;
  dataHora: string;
  titularOrigem?: string;
  titularDestino?: string;
}
export interface PageResponseDTO<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}
