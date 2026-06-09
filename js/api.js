// Endereço da minha API Java
const BASE_URL = 'http://localhost:8080/api/v1/reunioes';

// Função para buscar as reuniões
async function buscarReunioesNaAPI(){
    try{
    // O fetch "vai" até a URL e o await diz "espere a resposta chegar"
    const resposta = await fetch(BASE_URL);

    // Transforma o texto puro em um objeto JSON (Lista) que o JS entende
    const dadosJson = await resposta.json();

    return dadosJson;
    } catch (erro) {
        console.error("Erro ao conectar com Back-end:", erro);
        return []; // Retorna uma lista vazia se der erro (ex: servidor desligado)
    }
}