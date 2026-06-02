let livroSelecionado = null;

// Executa assim que a página carregar na tela
window.onload = function() {
    mostrarClientes();
    carregarClientesSelect();
    mostrarEmprestimos();
};

// GESTÃO DE CLIENTES
function CadastrarCliente() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();

    if (!nome || !email || !cpf) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    clientes.push({ nome, email, cpf });
    localStorage.setItem("clientes", JSON.stringify(clientes));

    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('cpf').value = '';

    mostrarClientes();
    carregarClientesSelect();

    alert("Cliente cadastrado com sucesso!");
}

function mostrarClientes() {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const listaClientes = document.getElementById("listaClientes");
    
    // Mantém o título h3 original
    listaClientes.innerHTML = "<h3>Clientes Cadastrados</h3>";
    
    if(clientes.length === 0) {
        listaClientes.innerHTML += "<p style='color: #64748b; font-size: 0.9rem;'>Nenhum cliente cadastrado.</p>";
        return;
    }

    clientes.forEach(cliente => {
        const clienteElement = document.createElement("div");
        clienteElement.className = "item-cadastrado";
        clienteElement.innerHTML = `
            <p><strong>Nome:</strong> ${cliente.nome}</p>
            <p><strong>Email:</strong> ${cliente.email}</p>
            <p><strong>CPF:</strong> ${cliente.cpf}</p>
        `;
        listaClientes.appendChild(clienteElement);
    });
}


// BUSCA INTELIGENTE DE LIVROS
async function buscarLivroAPI(nomeLivro) {
    try {
        const resposta = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(nomeLivro)}`);
        if (!resposta.ok) return null;
        const dados = await resposta.json();
        return dados.docs;
    } catch (erro) {
        console.error("Erro na requisição:", erro);
        return null;
    }
}

function renderizarLivros(livros) {
    const resultado = document.querySelector("#resultado-livros");
    resultado.innerHTML = "";

    livros.slice(0, 4).forEach(livro => {
        const capa = livro.cover_i
            ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
            : "";
        const autor = livro.author_name ? livro.author_name[0] : "Autor desconhecido";
        
        const tituloLimpo = livro.title.replace(/'/g, "\\'");

        resultado.innerHTML += `
            <div class="livro-card">
                <div>
                    ${capa ? `<img src="${capa}" alt="Capa do livro">` : "<p style='padding:20px 0;'>Sem capa</p>"}
                    <h4>${livro.title}</h4>
                    <p>${autor}</p>
                </div>
                <button onclick="selecionarLivro('${tituloLimpo}', '${capa}')">Selecionar</button>
            </div>
        `;
    });
}

function selecionarLivro(titulo, capa) {
    livroSelecionado = { titulo, capa };
    alert(`Livro selecionado com sucesso: "${titulo}". Agora escolha o cliente abaixo para finalizar.`);
}

// Evento do botão de busca
document.querySelector("#buscar-livro-btn").addEventListener("click", async () => {
    const nomeLivro = document.querySelector("#nome-livro").value.trim();
    const statusLivro = document.querySelector("#status-livro");
    const resultado = document.querySelector("#resultado-livros");

    if (nomeLivro === "") {
        alert("Digite o nome do livro.");
        return;
    }

    statusLivro.innerText = "Buscando livro...";
    resultado.innerHTML = "";

    const livros = await buscarLivroAPI(nomeLivro);

    if (livros && livros.length > 0) {
        renderizarLivros(livros);
        statusLivro.innerText = "";
    } else {
        statusLivro.innerText = "Livro não encontrado.";
    }
});


// CONTROLE DE EMPRÉSTIMOS 
function carregarClientesSelect() {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const select = document.getElementById("clienteSelect");

    select.innerHTML = '<option value="">Selecione um cliente...</option>';

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.nome;
        option.textContent = cliente.nome;
        select.appendChild(option);
    });
}

function FinalizarEmprestimo() {
    const cliente = document.getElementById("clienteSelect").value;

    if (!cliente) {
        alert("Selecione um cliente na lista.");
        return;
    }

    if (!livroSelecionado) {
        alert("Por favor, busque e selecione um livro primeiro.");
        return;
    }

    let emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
    const devolucao = new Date();
    devolucao.setDate(devolucao.getDate() + 7);

    emprestimos.push({
        cliente: cliente,
        livro: livroSelecionado.titulo,
        capa: livroSelecionado.capa,
        dataDevolucao: devolucao.toLocaleDateString("pt-BR")
    });

    localStorage.setItem("emprestimos", JSON.stringify(emprestimos));
    
    livroSelecionado = null; 
    document.getElementById("clienteSelect").value = "";

    mostrarEmprestimos();
    alert("Empréstimo realizado com sucesso!");
}

function mostrarEmprestimos() {
    const emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
    const container = document.getElementById("emprestimosAtivos");

    container.innerHTML = "<h3>Empréstimos Ativos</h3>";

    if(emprestimos.length === 0){
        container.innerHTML += "<p style='color: #64748b; font-size: 0.9rem;'>Nenhum empréstimo ativo.</p>";
        return;
    }

    emprestimos.forEach(emp => {
        const card = document.createElement("div");
        card.className = "item-cadastrado";
        card.style.borderLeftColor = "#4ade80";
        card.innerHTML = `
            <p><strong>Livro:</strong> ${emp.livro}</p>
            <p><strong>Lector/Cliente:</strong> ${emp.cliente}</p>
            <p style="color: #4ade80;"><strong>Devolução até:</strong> ${emp.dataDevolucao}</p>
        `;
        container.appendChild(card);
    });
}