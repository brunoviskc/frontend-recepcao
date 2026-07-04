/**
 * ==========================================================================
 * LOGICA DO PAINEL ADMINISTRATIVO - OG AMBIENTES
 * JavaScript Vanilla (ES6+) - Altamente Modularizado e Focado em UI/UX
 * ==========================================================================
 */

// 1. Referências de Elementos do DOM
const DOM = {
    form: document.getElementById('form-reuniao'),
    inputs: {
        data: document.getElementById('dataReuniao'),
        hora: document.getElementById('horaReuniao'),
        cliente: document.getElementById('nomeCliente'),
        arquiteto: document.getElementById('nomeArquiteto'),
        consultor: document.getElementById('nomeConsultor')
    },
    botoes: {
        submit: document.getElementById('btn-submit'),
        submitTexto: document.getElementById('btn-submit-texto'),
        submitSpinner: document.getElementById('btn-submit-spinner'),
        cancelar: document.getElementById('btn-cancelar'),
        atualizar: document.getElementById('btn-atualizar')
    },
    titulos: {
        formulario: document.getElementById('titulo-formulario')
    },
    cards: {
        formulario: document.querySelector('.form-section .card')
    },
    tabela: {
        corpo: document.getElementById('tabela-corpo'),
        linhaLoading: document.getElementById('linha-loading'),
        linhaVazia: document.getElementById('linha-vazia')
    },
    alertas: {
        erro: document.getElementById('alerta-erro'),
        erroMsg: document.getElementById('alerta-erro-mensagem'),
        sucesso: document.getElementById('alerta-sucesso'),
        sucessoMsg: document.getElementById('alerta-sucesso-mensagem')
    }
};

// 2. Estado Local da Aplicação (Simulando States do React)
const estado = {
    reunioes: [],
    reuniaoIdEmEdicao: null,
    carregando: false,
    salvando: false
};

// SVGs inline para os botões de ação na tabela (para evitar dependência de CDNs externas)
const ICONES = {
    edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`
};

// Timer para fechar automaticamente alertas de sucesso
let timerSucesso = null;

// 3. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    configurarDataMinima();
    registrarEventos();
    carregarAgendamentos();
});

// 4. Configurações Iniciais e Auxiliares
function configurarDataMinima() {
    // Obtém a data corrente local no fuso horário do usuário
    const dataLocal = new Date();
    const ano = dataLocal.getFullYear();
    const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
    const dia = String(dataLocal.getDate()).padStart(2, '0');

    // Define o atributo min do input date para impedir agendamentos retroativos
    const dataHojeFormatada = `${ano}-${mes}-${dia}`;
    DOM.inputs.data.min = dataHojeFormatada;
}

function registrarEventos() {
    // Evento de submissão do formulário
    DOM.form.addEventListener('submit', lidarComSubmissao);

    // Evento de clique para o botão cancelar
    DOM.botoes.cancelar.addEventListener('click', cancelarEdicao);

    // Evento para atualizar a tabela manualmente
    DOM.botoes.atualizar.addEventListener('click', carregarAgendamentos);
}

// 5. Funções de Manipulação de Alertas
function mostrarAlertaErro(mensagem) {
    DOM.alertas.erroMsg.innerText = mensagem;
    DOM.alertas.erro.classList.remove('escondido');
    DOM.alertas.sucesso.classList.add('escondido');
}

function mostrarAlertaSucesso(mensagem) {
    DOM.alertas.sucessoMsg.innerText = mensagem;
    DOM.alertas.sucesso.classList.remove('escondido');
    DOM.alertas.erro.classList.add('escondido');

    // Auto fechar alerta de sucesso após 5 segundos
    if (timerSucesso) clearTimeout(timerSucesso);
    timerSucesso = setTimeout(() => {
        fecharAlerta('alerta-sucesso');
    }, 5000);
}

// Declarado de forma global (vinculado ao objeto window) para que o onclick inline no HTML funcione
window.fecharAlerta = function (idAlerta) {
    const alerta = document.getElementById(idAlerta);
    if (alerta) {
        alerta.classList.add('escondido');
    }
};

function ocultarTodosAlertas() {
    DOM.alertas.erro.classList.add('escondido');
    DOM.alertas.sucesso.classList.add('escondido');
}

// 6. Funções de Formatação (Helpers Utilitários)
function formatarDataBR(dataString) {
    if (!dataString) return '';
    const partes = dataString.split('-');
    if (partes.length !== 3) return dataString;
    return `${partes[2]}/${partes[1]}/${partes[0]}`; // YYYY-MM-DD para DD/MM/YYYY
}

function formatarHoraHM(horaString) {
    if (!horaString) return '';
    const partes = horaString.split(':');
    if (partes.length < 2) return horaString;
    return `${partes[0]}:${partes[1]}`; // HH:MM:SS para HH:MM
}

// 7. Fluxos de Dados: Carregar e Renderizar Agendamentos (GET)
async function carregarAgendamentos() {
    if (estado.carregando) return;

    setCarregando(true);
    ocultarTodosAlertas();

    try {
        // Busca na API central de js/api.js
        const dados = await buscarReunioesNaAPI();

        // Armazena no estado local as reuniões
        estado.reunioes = dados;

        renderizarTabela();
    } catch (erro) {
        mostrarAlertaErro("Não foi possível carregar os agendamentos da fábrica. Verifique a conexão com o servidor.");
        setCarregando(false);
    }
}

function setCarregando(carregando) {
    estado.carregando = carregando;
    if (carregando) {
        DOM.tabela.linhaLoading.classList.remove('escondido');
        DOM.tabela.linhaVazia.classList.add('escondido');
        // Limpa linhas antigas
        const linhasDinamicas = DOM.tabela.corpo.querySelectorAll('tr:not(#linha-loading):not(#linha-vazia)');
        linhasDinamicas.forEach(linha => linha.remove());
    } else {
        DOM.tabela.linhaLoading.classList.add('escondido');
    }
}

function renderizarTabela() {
    setCarregando(false);

    // Limpa linhas dinâmicas antigas
    const linhasDinamicas = DOM.tabela.corpo.querySelectorAll('tr:not(#linha-loading):not(#linha-vazia)');
    linhasDinamicas.forEach(linha => linha.remove());

    if (estado.reunioes.length === 0) {
        DOM.tabela.linhaVazia.classList.remove('escondido');
        return;
    }

    DOM.tabela.linhaVazia.classList.add('escondido');

    // Ordenar as reuniões para exibir por ordem cronológica de data e hora
    const reunioesOrdenadas = [...estado.reunioes].sort((a, b) => {
        const dataA = new Date(`${a.dataReuniao}T${a.horaReuniao}`);
        const dataB = new Date(`${b.dataReuniao}T${b.horaReuniao}`);
        return dataA - dataB;
    });

    // Renderiza cada linha
    reunioesOrdenadas.forEach(reuniao => {
        const tr = document.createElement('tr');

        // Adiciona classe de destaque se esta linha estiver sendo editada
        if (estado.reuniaoIdEmEdicao === reuniao.id) {
            tr.classList.add('row-editing');
        }

        // Coluna Data
        const tdData = document.createElement('td');
        tdData.className = 'td-data';
        tdData.innerText = formatarDataBR(reuniao.dataReuniao);
        tr.appendChild(tdData);

        // Coluna Hora
        const tdHora = document.createElement('td');
        tdHora.className = 'td-hora';
        tdHora.innerText = formatarHoraHM(reuniao.horaReuniao);
        tr.appendChild(tdHora);

        // Coluna Cliente
        const tdCliente = document.createElement('td');
        tdCliente.className = 'td-nome';
        tdCliente.innerText = reuniao.nomeCliente;
        tr.appendChild(tdCliente);

        // Coluna Arquiteto
        const tdArquiteto = document.createElement('td');
        tdArquiteto.className = 'td-arquiteto';
        tdArquiteto.innerText = reuniao.nomeArquiteto;
        tr.appendChild(tdArquiteto);

        // Coluna Consultor
        const tdConsultor = document.createElement('td');
        tdConsultor.className = 'td-consultor';
        tdConsultor.innerText = reuniao.nomeConsultor;
        tr.appendChild(tdConsultor);

        // Coluna Ações
        const tdAcoes = document.createElement('td');
        tdAcoes.className = 'td-acoes';

        // Botão de Editar
        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn-action btn-edit';
        btnEdit.innerHTML = ICONES.edit;
        btnEdit.title = 'Editar Reunião';
        btnEdit.addEventListener('click', () => carregarModoEdicao(reuniao));
        tdAcoes.appendChild(btnEdit);

        // Botão de Excluir
        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-action btn-delete';
        btnDelete.innerHTML = ICONES.delete;
        btnDelete.title = 'Excluir Reunião';
        btnDelete.addEventListener('click', () => lidarComExclusao(reuniao.id, reuniao.nomeCliente));
        tdAcoes.appendChild(btnDelete);

        tr.appendChild(tdAcoes);
        DOM.tabela.corpo.appendChild(tr);
    });
}

// 8. Fluxos de Formulário: Envio de Dados (POST / PUT)
async function lidarComSubmissao(evento) {
    evento.preventDefault();
    ocultarTodosAlertas();

    if (estado.salvando) return;

    // Captura dos valores e validação simples com conversão para caixa alta
    const payload = {
        dataReuniao: DOM.inputs.data.value,
        horaReuniao: DOM.inputs.hora.value,
        nomeCliente: DOM.inputs.cliente.value.trim().toUpperCase(),
        nomeArquiteto: DOM.inputs.arquiteto.value.trim().toUpperCase(),
        nomeConsultor: DOM.inputs.consultor.value.trim().toUpperCase()
    };

    if (!payload.dataReuniao || !payload.horaReuniao || !payload.nomeCliente || !payload.nomeArquiteto || !payload.nomeConsultor) {
        mostrarAlertaErro("Todos os campos do formulário são de preenchimento obrigatório.");
        return;
    }

    // Validação local de choque de horários (+/- 30 min) baseado na exibição da TV
    const conflito = verificarConflitoHorario(payload.dataReuniao, payload.horaReuniao, estado.reuniaoIdEmEdicao);
    if (conflito) {
        const minutosPropostos = converterHoraParaMinutos(payload.horaReuniao);
        const horarioSugerido = calcularHorarioSugeridoDisponivel(payload.dataReuniao, minutosPropostos, estado.reuniaoIdEmEdicao);

        mostrarAlertaErro(`Choque de Horário: Já existe uma reunião marcada para o cliente "${conflito.nomeCliente}" às ${formatarHoraHM(conflito.horaReuniao)} nesta data. O horário ${formatarHoraHM(payload.horaReuniao)} está ocupado. Sugestão de horário livre próximo: ${horarioSugerido}.`);
        return;
    }

    setSalvando(true);

    try {
        if (estado.reuniaoIdEmEdicao !== null) {
            // Modo Edição (PUT)
            await atualizarReuniaoNaAPI(estado.reuniaoIdEmEdicao, payload);
            mostrarAlertaSucesso(`Agendamento de "${payload.nomeCliente}" atualizado com sucesso!`);
            cancelarEdicao(); // Sai do modo edição e limpa campos
        } else {
            // Modo Cadastro (POST)
            await cadastrarReuniaoNaAPI(payload);
            mostrarAlertaSucesso(`Reunião de "${payload.nomeCliente}" agendada com sucesso!`);
            limparFormulario(); // Limpa os campos do formulário
        }

        // Atualiza a tabela dinamicamente sem precisar de F5
        await carregarAgendamentos();
    } catch (erro) {
        // Intercepta erros lançados pela API (como HTTP 400 choque de horários)
        mostrarAlertaErro(erro.message || "Erro ao processar requisição no servidor.");
    } finally {
        setSalvando(false);
    }
}

function setSalvando(salvando) {
    estado.salvando = salvando;
    if (salvando) {
        DOM.botoes.submit.disabled = true;
        DOM.botoes.submitSpinner.classList.remove('escondido');
        DOM.botoes.submitTexto.innerText = estado.reuniaoIdEmEdicao !== null ? 'Salvando...' : 'Agendando...';
    } else {
        DOM.botoes.submit.disabled = false;
        DOM.botoes.submitSpinner.classList.add('escondido');
        DOM.botoes.submitTexto.innerText = estado.reuniaoIdEmEdicao !== null ? 'Salvar Alterações' : 'Confirmar Agendamento';
    }
}

function limparFormulario() {
    DOM.form.reset();
    // Restaura a validação de data mínima
    configurarDataMinima();
}

// 9. Fluxos de Formulário: Modo de Edição (PUT)
function carregarModoEdicao(reuniao) {
    ocultarTodosAlertas();

    // Define o ID em edição
    estado.reuniaoIdEmEdicao = reuniao.id;

    // Preenche os campos do formulário com os valores atuais da reunião
    DOM.inputs.data.value = reuniao.dataReuniao;
    DOM.inputs.hora.value = formatarHoraParaInput(reuniao.horaReuniao);
    DOM.inputs.cliente.value = reuniao.nomeCliente;
    DOM.inputs.arquiteto.value = reuniao.nomeArquiteto;
    DOM.inputs.consultor.value = reuniao.nomeConsultor;

    // Atualiza a interface do formulário
    DOM.titulos.formulario.innerText = "Editar Agendamento";
    DOM.botoes.submitTexto.innerText = "Salvar Alterações";
    DOM.botoes.cancelar.classList.remove('escondido');
    DOM.cards.formulario.classList.add('card-edit-mode');

    // Destaca visualmente a linha sendo editada na tabela
    renderizarTabela();

    // Rola a tela de volta de maneira suave para o formulário
    DOM.cards.formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function formatarHoraParaInput(horaString) {
    if (!horaString) return '';
    const partes = horaString.split(':');
    if (partes.length >= 2) {
        return `${partes[0]}:${partes[1]}`; // Extrai apenas HH:MM
    }
    return horaString;
}

function cancelarEdicao() {
    estado.reuniaoIdEmEdicao = null;

    // Limpa os campos
    limparFormulario();

    // Restaura o visual padrão do formulário
    DOM.titulos.formulario.innerText = "Agendar Nova Reunião";
    DOM.botoes.submitTexto.innerText = "Confirmar Agendamento";
    DOM.botoes.cancelar.classList.add('escondido');
    DOM.cards.formulario.classList.remove('card-edit-mode');

    // Remove destaque da tabela
    renderizarTabela();
}

// 10. Fluxo de Exclusão (DELETE)
async function lidarComExclusao(id, nomeCliente) {
    ocultarTodosAlertas();

    const confirmado = confirm(`Tem certeza que deseja excluir permanentemente a reunião agendada para o cliente "${nomeCliente}"?`);
    if (!confirmado) return;

    try {
        await excluirReuniaoNaAPI(id);
        mostrarAlertaSucesso(`Agendamento de "${nomeCliente}" excluído com sucesso.`);

        // Se a reunião que estava sendo editada foi deletada, cancela a edição
        if (estado.reuniaoIdEmEdicao === id) {
            cancelarEdicao();
        }

        // Recarrega a listagem imediatamente
        await carregarAgendamentos();
    } catch (erro) {
        mostrarAlertaErro(erro.message || `Erro ao tentar excluir reunião de "${nomeCliente}".`);
    }
}

// 11. Validações Locais Adicionais (Regra de Negócio de Exibição da TV)
function converterHoraParaMinutos(horaString) {
    if (!horaString) return 0;
    const partes = horaString.split(':');
    return (parseInt(partes[0], 10) * 60) + parseInt(partes[1], 10);
}

function verificarConflitoHorario(dataNova, horaNova, idIgnorado = null) {
    const minutosNovos = converterHoraParaMinutos(horaNova);

    for (const reuniao of estado.reunioes) {
        // Ignora a própria reunião que está sendo editada
        if (idIgnorado !== null && reuniao.id === idIgnorado) {
            continue;
        }

        // Se for na mesma data
        if (reuniao.dataReuniao === dataNova) {
            const minutosExistentes = converterHoraParaMinutos(reuniao.horaReuniao);
            const diferenca = Math.abs(minutosNovos - minutosExistentes);

            // Regra: se a diferença de horário for inferior a 30 minutos, há conflito de exibição na TV
            if (diferenca < 10) {
                return reuniao;
            }
        }
    }
    return null;
}

function formatarMinutosParaHoraHM(minutosTotais) {
    const horas = Math.floor(minutosTotais / 60);
    const minutos = minutosTotais % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function calcularHorarioSugeridoDisponivel(data, minutosPropostos, idIgnorado = null) {
    let minutosSugeridos = minutosPropostos + 10;
    let tentativa = 0;

    // Varre de 10 em 10 minutos a partir do horário proposto até achar uma brecha livre na agenda
    while (tentativa < 144) {
        if (minutosSugeridos >= 1440) {
            minutosSugeridos = minutosSugeridos - 1440;
        }

        const horaFormatada = formatarMinutosParaHoraHM(minutosSugeridos);

        // Testa se esse horário está livre de conflitos (+/- 10 min)
        const conflito = verificarConflitoHorario(data, horaFormatada, idIgnorado);
        if (!conflito) {
            return horaFormatada;
        }

        // Incrementa mais 10 min para a próxima tentativa
        minutosSugeridos += 10;
        tentativa++;
    }
    return formatarMinutosParaHoraHM(minutosPropostos + 10); // Fallback padrão
}
