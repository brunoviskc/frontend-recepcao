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

// Variáveis globais para controlar o nosso "carrosel"
let reunioesDeHoje = [];
let indiceAtual = 0;

// Função principal que inicia a TV
async function iniciarTV(){
    console.log("Iniciando a TV...");

    //1. Busca todos os dados da API Jaca
    const todasAsReunioes = await buscarReunioesNaAPI();

    //2. Descobre a data de hoje pelo sistema (Formato YYYY-MM-DD)
    // Pega a data local do computador
    const dataLocal = new Date();
    const ano = dataLocal.getFullYear();
    const mes = String(dataLocal.getMonth() + 1).padStart(2, '0'); // Garante que terá 2 dígitos (ex: 06)
    const dia = String(dataLocal.getDate()).padStart(2, '0');
    // Junta tudo no formato YYYY-MM-DD
    const dataHoje = `${ano}-${mes}-${dia}`;

    //3. Filtra a lista: Guarda apenas as reuniões cuja data seja igual a de hoje
    reunioesDeHoje = todasAsReunioes.filter(reuniao => reuniao.dataReuniao === dataHoje);

    //4. Toma uma decisão: tem reuniao para hoje?
    if(reunioesDeHoje.length > 0) {
        atualizarTela(); // Pinta a tela com o primeiro cliente
        // Inicia o loop do carrossel (muda de slide a cada 10.000 milissegundos = 10s)
        setInterval(proximoSlide, 10000);
    } else {
        exibirTelaVazia(); // Pintar a tela de "Agenda Livre"
    }

    //5. Polling: Vai na API buscar novos agendamentos a cada 1 minuto (60000 ms) silenciosamente
    setInterval(buscarNovamente, 60000);
}

// Função que injeta o texto real no HTML (Manipulação de DOM)
function atualizarTela(){
    const reuniao = reunioesDeHoje[indiceAtual];

    // Pega as tags <h1> e <h2> pelo ID e troca o texto delas
    document.getElementById('nome-cliente').innerText = reuniao.nomeCliente;
    document.getElementById('mensagem-boas-vindas').innerText = "BEM VINDOS À NOSSA FÁBRICA";
}

// Função para pular para o proxímo cliente no carrossel
function proximoSlide(){
    indiceAtual++; // Soma 1 no índice

    // Se chegou no final da lista, volta para o primeiro (índice 0)
    if (indiceAtual >= reunioesDeHoje.length){
        indiceAtual = 0;
    }

    atualizarTela();
}

// Função caso não tem ninguém marcado para o dia
function exibirTelaVazia() {
    document.getElementById('nome-cliente').innerText = "";
    document.getElementById('mensagem-boas-vindas').innerText = "BEM VINDO À NOSSA FÁBRICA"
}

// Função silenciosa para o loop de 1 minuto (Polling)
async function buscarNovamente(){
    const todasAsReunioes = await buscarReunioesNaAPI();
    
    const dataLocal = new Date();
    const ano = dataLocal.getFullYear();
    const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
    const dia = String(dataLocal.getDate()).padStart(2, '0');
    const dataHoje = `${ano}-${mes}-${dia}`;
    
    reunioesDeHoje = todasAsReunioes.filter(reuniao => reuniao.dataReuniao === dataHoje);

    if (reunioesDeHoje.length === 0) {
        exibirTelaVazia();
    } else if (indiceAtual >= reunioesDeHoje.length) {
        // Se o array diminuiu (alguém deletou uma reunião) e o índice se perdeu, reseta
        indiceAtual = 0;
        atualizarTela();
    }
}

// O gatilho: Executa a função principal assim que o arquivo carregar
iniciarTV();

