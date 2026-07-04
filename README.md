# Sistema de Recepção Corporativa - OG Ambientes

Este repositório contém o front-end do sistema de recepção da **OG Ambientes**, uma fábrica de móveis planejados de alto padrão. O sistema foi projetado para rodar em duas frentes: uma tela passiva de boas-vindas (TV/Monitor) na recepção e um Painel Administrativo moderno para gerenciamento dos agendamentos pela secretária.

O projeto consome uma API RESTful desenvolvida em Java (Spring Boot) exposta em `http://localhost:8080/api/v1/reunioes`.

---

## 🚀 Pilha Tecnológica

A interface foi construída seguindo princípios de arquitetura limpa e modularização, facilitando uma futura migração para **React**:
* **HTML5 Semântico**: Estrutura acessível e bem demarcada (`<header>`, `<main>`, `<section>`, `<table>`, `<form>`).
* **CSS3 Corporativo**: Layout baseado em **Flexbox** e **CSS Grid**. Identidade visual sóbria nas cores grafite (`#12161b`), off-white (`#f4f6f8`) e acentos refinados em bronze escovado (`#b08e5a`) com foco em alto padrão.
* **JavaScript Vanilla (ES6+)**: Organizado em módulos de responsabilidade única para separação de preocupações (rede, UI, manipulação de DOM).

---

## 📁 Estrutura de Diretórios

```bash
/frontend-recepcao
├── /assets
│   ├── /css
│   │   ├── style-admin.css    # Estilo premium do painel administrativo
│   │   └── style-tv.css       # Estilo dedicado à TV de recepção
│   └── /img
│       ├── LOGO-3D.svg        # Logotipo principal da OG Ambientes
│       └── LOGO-INTERNATIONAL-PROPERTY-AWARDS.svg
├── /js
│   ├── api.js                 # Camada de comunicação assíncrona (Fetch API)
│   ├── app-admin.js           # Lógica do painel de administração (DOM/Eventos)
│   └── app-tv.js              # Lógica do display da TV e polling de dados
├── index.html                 # Tela de boas-vindas (TV de recepção)
├── admin.html                 # Painel de controle da recepção (Cadastro/Listagem)
└── README.md                  # Documentação do projeto (este arquivo)
```

---

## 🛠️ Funcionalidades e Regras de Negócio

### 📺 Tela de Boas-Vindas da TV (`index.html` & `app-tv.js`)
* **Exibição Inteligente**: Filtra automaticamente os agendamentos cadastrados para o dia corrente.
* **Sincronização em Tempo Real**: Possui um loop de relógio local de 1 segundo que ativa o banner de boas-vindas do cliente exatamente na sua hora de exibição, sem depender de ciclos de rede.
* **Polling de API**: Consulta a API Java de 30 em 30 segundos silenciosamente buscando atualizações feitas no painel.

### 🖥️ Painel Administrativo (`admin.html` & `app-admin.js`)
* **Operações Completas (CRUD)**:
  * **GET**: Lista de reuniões futuras carregada de forma assíncrona e reativa.
  * **POST**: Formulário de agendamento que limpa inputs ao ser enviado com sucesso.
  * **PUT (Edição)**: Ao clicar no ícone de lápis, o formulário entra em "Modo de Edição" (mudança de cores, títulos e botões). Rola a página suavemente até o formulário de preenchimento. O validador ignora o ID em edição para evitar autochoque de horário.
  * **DELETE (Exclusão)**: Solicitação de confirmação segura antes de acionar a deleção na API.
* **Regra de Ocupação da TV (Validação Local)**: A TV exibe o cliente **10 minutos antes** e **10 minutos depois** do agendamento (janela de 20 minutos). O painel realiza validação de choque de horário local impedindo novos agendamentos na mesma data com diferença menor que 10 minutos de um agendamento existente.
* **Sugestão de Horário Livre**: Em caso de colisão, o sistema calcula o próximo horário disponível na data (somando blocos de 10 min sucessivamente) e o exibe no banner de erro.
* **Normalização de Caixa Alta**: Converte os campos de texto (*Nome do Cliente*, *Nome do Arquiteto* e *Nome do Consultor*) visualmente em caixa alta via CSS na digitação e fisicamente via JS antes de enviar o payload de cadastro/edição ao back-end.
* **Data Retroativa**: Bloqueio de seleção de datas no passado no calendário.
* **Reatividade sem F5**: Atualização imediata do Data Grid local e limpeza do formulário após qualquer sucesso na API, sem requerer recarregamento da página.

---

## 💻 Como Usar

### Pré-requisitos
1. Certifique-se de que a API Java Spring Boot está em execução na porta `8080`:
   `http://localhost:8080/api/v1/reunioes`.

### Executando Localmente
Por ser um projeto puramente estático de front-end (HTML/CSS/JS), você pode abrir diretamente as telas no navegador ou usar um servidor estático local:

#### Opção 1: Live Server (Recomendado)
Se utiliza o VS Code, instale a extensão **Live Server**:
1. Abra a pasta `/frontend-recepcao` no editor.
2. Clique com o botão direito sobre o arquivo `index.html` ou `admin.html` e selecione **"Open with Live Server"**.
3. As aplicações rodarão localmente em um endereço como `http://127.0.0.1:5500/`.

#### Opção 2: Servidor Estático de Linha de Comando (npm)
Se você tem o Node.js instalado, utilize o pacote `http-server`:
```bash
# Navegue até a pasta do projeto
cd c:/Users/OG Ambientes/Desktop/Estudo/Hakaton/frontend-recepcao

# Execute o servidor estático
npx http-server -p 3000
```
Acesse `http://localhost:3000/index.html` para a TV e `http://localhost:3000/admin.html` para o painel.

---

## 🧪 Roteiro de Testes Rápidos

1. **Testar Bloqueio de Calendário**: Tente selecionar a data de ontem no calendário do formulário do painel. A seleção deve estar travada nativamente.
2. **Testar Caixa Alta**: Digite `Carlos eduardo` no campo do Cliente. Note que o texto aparece em maiúsculas à medida que digita. Após enviar, veja na tabela que o nome foi persistido como `CARLOS EDUARDO`.
3. **Testar Choque de Horários e Sugestão**:
   * Agende uma reunião para hoje às **15:00**.
   * Tente agendar outra reunião para hoje às **15:05**. A interface deve bloquear o envio e exibir um banner vermelho no topo contendo o aviso: *"O horário 15:05 está ocupado. Sugestão de horário livre próximo: 15:10"*.
4. **Testar Edição (PUT)**:
   * Clique no botão de editar da reunião de 15:00. O card do formulário ficará em modo dourado e o botão "Cancelar" aparecerá.
   * Altere o nome do arquiteto e clique em "Salvar Alterações". A tabela e o formulário serão atualizados instantaneamente.
5. **Testar Sincronização com a TV**:
   * Deixe a página `index.html` aberta.
   * No painel, agende uma reunião para hoje em um horário cuja janela de +/- 10 minutos englobe a hora atual do computador (ex: se agora são 17:35, agende para as 17:40).
   * Olhe a página da TV: ela deve mudar de forma instantânea e autônoma, exibindo as boas-vindas ao cliente sem precisar de F5.
