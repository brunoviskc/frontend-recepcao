// // Função que inicia a nossa TV
// async function iniciarTV(){
//     console.log("Iniciando a TV e chamando a API...");

//     // Chama a função que criamos no arquivo api.js
//     const reunioes = await buscarReunioesNaAPI();

//     // Imprime o resultado no painel de desenvolvedor do navegador
//     console.log("Os dados chegaram do Java", reunioes);
// }

// // Executa a função assim que o arquivo carregar
// iniciarTV();

//-------------------------------------------------------------------------------------------

// Variável global para armazenar a lista de agendamentos do dia
let reunioesDeHoje = [];

// 1. Função principal que inicia a TV
async function iniciarTV() {
    console.log("Iniciando a TV com Inteligência de Horário (+/- 10 min)...");

    // Processa a agenda pela primeira vez assim que a página abre
    await processarAgenda();

    // Polling de Rede: Roda a cada 30 segundos silenciosamente buscando novos dados
    setInterval(processarAgenda, 30000);

    // Loop do Relógio: Verifica a cada 1 segundo a hora local do computador.
    // Isso faz a tela trocar no exato segundo em que o horário de exibição chega.
    setInterval(decidirOQueMostrarNaTela, 1000);
}

// 2. Função responsável por buscar no Java e filtrar a data de hoje
async function processarAgenda() {
    const todasAsReunioes = await buscarReunioesNaAPI();

    // Pega a data local do computador (Evita bug do fuso UTC de Londres)
    const dataLocal = new Date();
    const ano = dataLocal.getFullYear();
    const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
    const dia = String(dataLocal.getDate()).padStart(2, '0');
    const dataHoje = `${ano}-${mes}-${dia}`;

    // Guarda apenas as reuniões de hoje
    reunioesDeHoje = todasAsReunioes.filter(reuniao => reuniao.dataReuniao === dataHoje);

    // Chama o cérebro da TV para decidir o que pintar na tela agora
    decidirOQueMostrarNaTela();
}

// 3. O Cérebro: Toma a decisão baseada no relógio atual
function decidirOQueMostrarNaTela() {
    const agora = new Date();
    const minutosAtuais = (agora.getHours() * 60) + agora.getMinutes();

    // Ordena as reuniões de hoje por ordem cronológica (da mais cedo para a mais tarde)
    reunioesDeHoje.sort((a, b) => converterHoraParaMinutos(a.horaReuniao) - converterHoraParaMinutos(b.horaReuniao));

    let reuniaoAtiva = null;

    // Varre todas as reuniões agendadas para hoje
    for (let reuniao of reunioesDeHoje) {
        const minutosReuniao = converterHoraParaMinutos(reuniao.horaReuniao);

        // Regra de Negócio: Janela de 20 minutos total
        const inicioExibicao = minutosReuniao - 10; // 10 minutos ANTES
        const fimExibicao = minutosReuniao + 10;    // 10 minutos DEPOIS

        // Se o relógio atual estiver dentro dessa janela, encontramos a reunião da vez!
        if (minutosAtuais >= inicioExibicao && minutosAtuais <= fimExibicao) {
            reuniaoAtiva = reuniao;
            break; // O 'break' interrompe o loop e TRAVA esse cliente na tela!
        }
    }

    // Aplica na tela o resultado da decisão
    if (reuniaoAtiva !== null) {
        exibirTelaCliente(reuniaoAtiva.nomeCliente);
    } else {
        exibirTelaDefault();
    }
}

// --- FUNÇÕES UTILITÁRIAS E DE MANIPULAÇÃO DE TELA (DOM) ---

// Converte texto de hora ("14:30:00") em minutos totais do dia (870)
function converterHoraParaMinutos(horaString) {
    if (!horaString) return 0;
    const partes = horaString.split(':');
    return (parseInt(partes[0], 10) * 60) + parseInt(partes[1], 10);
}

// Pinta a tela com o nome do cliente (Durante a janela dos +/- 10 min)
function exibirTelaCliente(nome) {
    // Se você tiver criado as divs separadas no HTML, podemos alterná-las aqui.
    // Usando a sua estrutura base:
    document.getElementById('nome-cliente').innerText = nome;
    document.getElementById('mensagem-boas-vindas').innerText = "BEM VINDO À NOSSA FÁBRICA";
}

// Pinta a tela Padrão/Standby (Quando não há reuniões na janela de tempo)
function exibirTelaDefault() {
    // Aqui a TV fica em modo de espera (sem nome de cliente)
    document.getElementById('nome-cliente').innerText = "";
    document.getElementById('mensagem-boas-vindas').innerText = "BEM VINDO À NOSSA FÁBRICA";
}

// O gatilho: Executa a função principal assim que o script é carregado pelo navegador
iniciarTV();

