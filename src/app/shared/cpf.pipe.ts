import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpf',
  standalone: true
})
export class CpfPipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';

    // Remove qualquer caractere que não seja número
    const cpf = value.toString().replace(/\D/g, '');

    // Verifica se tem 11 dígitos, caso contrário retorna o valor limpo
    if (cpf.length !== 11) return cpf;

    // Aplica a máscara: 000.000.000-00
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
