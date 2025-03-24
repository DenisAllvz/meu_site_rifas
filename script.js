let totalRifas = 100;
let participantes = JSON.parse(localStorage.getItem("rifas")) || [];
let selecionadas = [];
let gapiInitialized = false;

function gerarNumeroRifa() {
    if (selecionadas.length === 0) {
        alert("Nenhuma rifa selecionada!");
        return null;
    }
    return selecionadas.pop();
}

function gerarTabelaRifas() {
    let rifasOcupadas = participantes.map(p => p.numeroRifa);
    let tabela = document.getElementById("tabelaRifas");
    tabela.innerHTML = "";

    let colunas = 10; // Define o número de colunas por linha
    let linha;

    for (let i = 1; i <= totalRifas; i++) {
        if ((i - 1) % colunas === 0) {
            linha = document.createElement("tr");
            tabela.appendChild(linha);
        }

        let celula = document.createElement("td");
        celula.textContent = i;
        celula.classList.add(rifasOcupadas.includes(i) ? "comprada" : "disponivel");

        // Adiciona evento de clique para selecionar rifas disponíveis
        if (!rifasOcupadas.includes(i)) {
            celula.addEventListener("click", () => selecionarRifa(i, celula));
        }

        linha.appendChild(celula);
    }
}

function selecionarRifa(numero, celula) {
    let index = selecionadas.indexOf(numero);
    if (index === -1) {
        selecionadas.push(numero);
        celula.classList.add("selecionado");
    } else {
        selecionadas.splice(index, 1);
        celula.classList.remove("selecionado");
    }
}

function confirmarCompra() {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    if (!nome || !telefone || !endereco) {
        alert("Por favor, preencha todos os campos do participante.");
        return;
    }

    if (selecionadas.length === 0) {
        alert("Nenhuma rifa selecionada!");
        return;
    }

    selecionadas.forEach(numeroRifa => {
        const participante = {
            nome,
            telefone,
            endereco,
            numeroRifa
        };

        participantes.push(participante);
        if (gapiInitialized) {
            appendDataToSheet([nome, telefone, endereco, numeroRifa]);
        }
    });

    localStorage.setItem("rifas", JSON.stringify(participantes));
    selecionadas = []; // Limpa as rifas selecionadas
    atualizarLista();
    limparCampos();
}

function resetarBanco() {
    if (confirm("Tem certeza que deseja resetar todas as rifas?")) {
        localStorage.removeItem("rifas"); // Apaga o banco de dados
        participantes = []; // Reseta a lista em memória
        atualizarLista(); // Atualiza a interface
    }
}

function realizarSorteio() {
    if (participantes.length === 0) {
        alert("Não há participantes para realizar o sorteio.");
        return;
    }

    let rifaSorteada = participantes[Math.floor(Math.random() * participantes.length)];
    alert(`A rifa sorteada foi: ${rifaSorteada.numeroRifa}, Nome: ${rifaSorteada.nome}`);
    if (gapiInitialized) {
        appendDataToSheet([rifaSorteada.nome, rifaSorteada.telefone, rifaSorteada.endereco, rifaSorteada.numeroRifa]);
    }
    atualizarLista();
}

function atualizarLista() {
    gerarTabelaRifas();
}

function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('endereco').value = '';
}

const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

function loadCredentials() {
    const CLIENT_ID = '997691138493-3s6goek90d6ohucnn1t9960ek731psv8.apps.googleusercontent.com';
    const API_KEY = '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';

    initClient(CLIENT_ID, API_KEY);
}

function initClient(CLIENT_ID, API_KEY) {
    gapi.load('client:auth2', () => {
        gapi.auth2.init({ client_id: CLIENT_ID }).then(() => {
            console.log("Google Auth Initialized");
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
            }).then(() => {
                gapi.auth2.getAuthInstance().signIn().then(() => {
                    gapiInitialized = true;
                });
            });
        }).catch(err => console.error("Erro na inicialização do Google Auth", err));
    });
}

function appendDataToSheet(data) {
    const params = {
        spreadsheetId: '11r-ifeOa8hmxV4OmDTF2dBtdQ-qD26x04mejYPDtuLA',
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
    };

    const valueRangeBody = {
        "values": [data]
    };

    gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody).then((response) => {
        console.log(response.result);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadCredentials();
    atualizarLista();
});