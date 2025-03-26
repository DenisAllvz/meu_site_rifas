// Configuração do Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

// Seu código restante aqui...


// Seu código restante aqui...


let totalRifas = 100;
let participantes = [];
let selecionadas = [];

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
        db.collection("participantes").add(participante)
            .then(() => {
                console.log("Participante adicionado com sucesso!");
            })
            .catch(error => {
                console.error("Erro ao adicionar participante: ", error);
            });
    });

    selecionadas = []; // Limpa as rifas selecionadas
    atualizarLista();
    limparCampos();
}

function resetarBanco() {
    if (confirm("Tem certeza que deseja resetar todas as rifas?")) {
        db.collection("participantes").get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                doc.ref.delete();
            });
        }).then(() => {
            participantes = [];
            atualizarLista();
        }).catch(error => {
            console.error("Erro ao resetar banco: ", error);
        });
    }
}

function realizarSorteio() {
    if (participantes.length === 0) {
        alert("Não há participantes para realizar o sorteio.");
        return;
    }

    let rifaSorteada = participantes[Math.floor(Math.random() * participantes.length)];
    alert(`A rifa sorteada foi: ${rifaSorteada.numeroRifa}, Nome: ${rifaSorteada.nome}`);
    atualizarLista();
}

function atualizarLista() {
    db.collection("participantes").get().then(querySnapshot => {
        participantes = querySnapshot.docs.map(doc => doc.data());
        gerarTabelaRifas();
    }).catch(error => {
        console.error("Erro ao atualizar lista: ", error);
    });
}

function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('endereco').value = '';
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarLista();
});