# Arquitetura do Front-End - Recepção OG Ambientes

Este documento define a estrutura e o planejamento para a construção da interface web que consumirá a API RESTful de agendamentos. O projeto utilizará HTML5, CSS3 e JavaScript (Vanilla) com arquitetura modularizada.

## 📁 Estrutura de Diretórios

* `/frontend-recepcao`: Pasta raiz do projeto.
* `/assets/img`: Diretório para armazenar logotipos e imagens de fundo (plantas baixas).
* `/assets/css`: Diretório para as folhas de estilo.
* `/assets/css/style-tv.css`: Estilos específicos para a tela de exibição passiva (TV).
* `/assets/css/style-admin.css`: Estilos para o painel de gerenciamento.
* `/js/api.js`: Módulo central para requisições assíncronas (Fetch API) com o Spring Boot.
* `/js/app-tv.js`: Módulo de lógica do carrossel rotativo e atualização autônoma da TV.
* `/js/app-admin.js`: Módulo de manipulação de formulários e renderização da tabela de dados.
* `index.html`: Arquivo principal contendo a tela de boas-vindas estruturada.
* `admin.html`: Arquivo secundário contendo a interface de cadastro e listagem.

## 🖥️ Etapa 1: A Tela de Boas-Vindas (index.html)

* Foco em UI/UX para exibição em telas grandes (TVs/Monitores).
* Estrutura HTML semântica sem interação do usuário (tela passiva).
* Lógica JS (app-tv.js) com Polling: consultas automáticas à API a cada 60 segundos.
* Regra de negócio no JS: Filtrar e exibir exclusivamente agendamentos do dia atual.
* Transição suave (Slide) entre múltiplos clientes do mesmo dia.

## 🛠️ Etapa 2: O Painel Administrativo (admin.html)

* Foco em utilidade e inserção rápida de dados pela equipe.
* Formulário de cadastro bloqueando datas retroativas na interface.
* Data Grid (Tabela) listando todas as reuniões futuras.
* Botões de ação (Editar/Excluir) integrados com os verbos PUT e DELETE da API.
* Tratamento de respostas de erro da API (HTTP 400) com alertas visuais amigáveis.