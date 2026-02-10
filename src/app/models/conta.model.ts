// Representa o dado que chega da API
export interface ContaDTO {
  id: number;
  numero: string;
  titular: string; // Verifique se no Java não está 'nomeCliente' ou 'nome'
  cpf: string;
  saldo: number;
}

// Representa a transação no extrato
export interface TransacaoDTO {
  id: number;
  tipo: string; // 'CREDITO' | 'DEBITO' | 'TRANSFERENCIA'
  valor: number;
  dataHora: string;
  titularOrigem?: string;  // Adicione isso
  titularDestino?: string; // Adicione isso
}

// Para as respostas paginadas do Spring
export interface PageResponseDTO<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}
