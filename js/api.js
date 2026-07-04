// Endereço da minha API Java
const BASE_URL = 'http://localhost:8080/api/v1/reunioes';

/**
 * Função utilitária para extrair e tratar mensagens de erro da API.
 * Suporta o formato padrão de exceções do Spring Boot e validações personalizadas.
 */
async function lidarComErroAPI(resposta) {
    let mensagemErro = `Erro na requisição (Status ${resposta.status}).`;
    try {
        const dadosErro = await resposta.json();
        // Tratamento para validações do Spring (Bean Validation que retorna uma lista de erros)
        if (dadosErro.errors && Array.isArray(dadosErro.errors)) {
            mensagemErro = dadosErro.errors.map(err => err.defaultMessage || err.message || err).join(', ');
        } else {
            // Suporta os formatos de campo mensagem, message, ou erro comuns em APIs Java
            mensagemErro = dadosErro.mensagem || dadosErro.message || dadosErro.erro || mensagemErro;
        }
    } catch (e) {
        // Se a resposta não for JSON, tenta obter como texto puro
        try {
            const textoErro = await resposta.text();
            if (textoErro) mensagemErro = textoErro;
        } catch (e2) {}
    }
    return new Error(mensagemErro);
}

// Função para buscar as reuniões (GET)
async function buscarReunioesNaAPI() {
    try {
        const resposta = await fetch(BASE_URL);
        if (!resposta.ok) {
            throw await lidarComErroAPI(resposta);
        }
        return await resposta.json();
    } catch (erro) {
        console.error("Erro ao buscar reuniões no Back-end:", erro);
        // Retorna uma lista vazia para evitar quebras de loop ou polling na tela da TV
        return [];
    }
}

// Função para cadastrar uma nova reunião (POST)
async function cadastrarReuniaoNaAPI(reuniao) {
    try {
        const resposta = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reuniao)
        });
        if (!resposta.ok) {
            throw await lidarComErroAPI(resposta);
        }
        return await resposta.json();
    } catch (erro) {
        console.error("Erro ao cadastrar reunião no Back-end:", erro);
        throw erro; // Propaga o erro para a UI do painel administrativo
    }
}

// Função para atualizar uma reunião existente (PUT)
async function atualizarReuniaoNaAPI(id, reuniao) {
    try {
        const resposta = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reuniao)
        });
        if (!resposta.ok) {
            throw await lidarComErroAPI(resposta);
        }
        return await resposta.json();
    } catch (erro) {
        console.error(`Erro ao atualizar reunião ${id} no Back-end:`, erro);
        throw erro; // Propaga o erro para a UI do painel administrativo
    }
}

// Função para excluir uma reunião (DELETE)
async function excluirReuniaoNaAPI(id) {
    try {
        const resposta = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!resposta.ok) {
            throw await lidarComErroAPI(resposta);
        }
        return true; // Retorna true em caso de sucesso
    } catch (erro) {
        console.error(`Erro ao excluir reunião ${id} no Back-end:`, erro);
        throw erro; // Propaga o erro para a UI do painel administrativo
    }
}