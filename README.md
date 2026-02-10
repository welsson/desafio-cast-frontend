# 🎨 Desafio CAST - Frontend

> Interface moderna desenvolvida com **Angular 19+**, focada em componentes standalone, performance reativa com Signals e uma experiência de usuário.

---

## 🛠️ Tecnologias e Ferramentas

* **Angular 19 (Standalone)** - Arquitetura moderna sem NgModules, mais leve e performática.
* **Angular Material** - Biblioteca de componentes de UI de alta qualidade.
* **TypeScript** - Tipagem forte para um código mais seguro.
* **SASS (SCSS)** - Estilização avançada e modular.
* **Signals** - Gerenciamento de estado reativo nativo do Angular.

---

## 🌟 Diferenciais Técnicos

* **Arquitetura Standalone:** Todo o projeto foi construído sem o uso de `AppModule`, utilizando o novo padrão de inicialização e injeção de dependências.
* **Responsividade:** Layout adaptável para diferentes tamanhos de tela utilizando Flexbox/Grid.
* **Consumo de API:** Service unificado para comunicação com o backend Spring Boot, utilizando o `HttpClient` com as novas APIs de configuração.

---

## 📖 Como rodar o projeto localmente

### Pré-requisitos
* Node.js (versão LTS recomendada)
* Angular CLI instalado (`npm install -g @angular/cli`)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/welsson/desafio-cast-frontend.git](https://github.com/welsson/desafio-cast-frontend.git)
   cd desafio-cast

2. **Instale as dependências:**

   npm install
   
3. **Inicie o servidor de desenvolvimento:**

   ng serve

4. **Acesse no navegador:**

   🔗 http://localhost:4200

3.  
## ⚙️ Integração com o Backend:

 Integração com o Backend   

 O frontend consome uma API REST desenvolvida em Spring Boot. 

* **URL Base da API:** `http://localhost:8520/v1`

> **Nota:** Para o funcionamento correto das operações de saque e listagem, certifique-se de que o backend está ativo antes de iniciar o frontend.
