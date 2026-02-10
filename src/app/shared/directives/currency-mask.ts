import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[appCurrencyMask]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CurrencyMaskDirective),
    multi: true
  }]
})
export class CurrencyMaskDirective implements ControlValueAccessor {
  // Inicializamos com funções vazias para evitar o erro de "possibly null"
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

 @HostListener('input', ['$event'])
  onInput(event: Event) {
    // 1. Fazemos o cast do target para HTMLInputElement com segurança
    const input = event.target as HTMLInputElement;

    if (!input) return;

    // 2. Pegamos o valor atual, removemos caracteres não numéricos
    let digits = input.value.replace(/\D/g, '');

    // 3. Transformamos em decimal (centavos)
    const numberValue = (Number(digits) / 100);

    // 4. Aplicamos a máscara visual no campo
    input.value = this.formatVisual(numberValue);

    // 5. Notificamos o Angular (ngModel/FormControl) sobre o valor numérico puro
    if (this.onChange) {
      this.onChange(numberValue);
    }
  }

  formatVisual(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  writeValue(value: any): void {
    // Garantimos que o valor seja numérico ou zero
    const numericValue = value || 0;
    this.el.nativeElement.value = this.formatVisual(numericValue);
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }
}
