// 1. LOGIN E SESSÃO
function fazerLogin(){
    localStorage.removeItem("leitorLogado");

    const usuario = document.getElementById('user').value.trim();
    const senha = document.getElementById('pass').value;

    if (usuario === 'administrador' && senha === '666'){ 
        window.location.href = "gestaoClientes.html";
        return; 
    }
    
    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    const clienteExiste = clientes.find(cliente => cliente.nome.toLowerCase() === usuario.toLowerCase());

    // Valida o cliente ou usuário padrão 'leitor'
    if (clienteExiste && senha === '777') {
        localStorage.setItem("leitorLogado", clienteExiste.nome);
        window.location.href = "buscaInteligente.html";
    } else if (usuario === 'leitor' && senha === '777') {
        window.location.href = "buscaInteligente.html";
    } else {
        alert("Usuário não cadastrado ou senha incorreta!");
    }
}

// 2. NAVEGAÇÃO
function irParaGestaoClientes() {
    window.location.href = "gestaoClientes.html";
}

// 3. INICIALIZAÇÃO DA PÁGINA (window.onload)
let livroSelecionado = null;

window.onload = function() {
    mostrarClientes();
    carregarClientesSelect();
    mostrarEmprestimos();
};

// 4. GESTÃO DE CLIENTES
function CadastrarCliente() {
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');

    if (!nomeInput || !emailInput || !cpfInput) return;

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const cpf = cpfInput.value.trim();

    if (!nome || !email || !cpf) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    clientes.push({ nome, email, cpf });
    localStorage.setItem("clientes", JSON.stringify(clientes));

    nomeInput.value = '';
    emailInput.value = '';
    cpfInput.value = '';

    mostrarClientes();
    carregarClientesSelect();

    alert("Cliente cadastrado com sucesso!");
    window.location.href = "gestaoClientes.html"; 
}

function mostrarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    if (!listaClientes) return; // Proteção contra erros
    
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    listaClientes.innerHTML = "<h3>Clientes Cadastrados</h3>";
    
    if(clientes.length === 0) {
        listaClientes.innerHTML += "<p style='color: #282e35; font-size: 0.9rem;'>Nenhum cliente cadastrado.</p>";
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

// 5. BUSCA INTELIGENTE DE LIVROS (API)
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
    if (!resultado) return;

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
    const leitorLogado = localStorage.getItem("leitorLogado");

    if (leitorLogado) {
        // Fluxo Leitor: Faz o empréstimo automático na hora
        const confirmar = confirm(`Deseja confirmar o empréstimo do livro "${titulo}" para você (${leitorLogado})?`);
        if (confirmar) {
            FinalizarEmprestimoAutomatico(leitorLogado);
        }
    } else {
        // Fluxo Admin
        alert(`Livro selecionado com sucesso: "${titulo}". Agora vá para o Controle de Empréstimos para associá-lo a um cliente.`);
    }
}

// Escuta o botão de busca apenas se ele existir na página atual
document.addEventListener("DOMContentLoaded", () => {
    const btnBusca = document.querySelector("#buscar-livro-btn");
    if (btnBusca) {
        btnBusca.addEventListener("click", async () => {
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
    }
});

// 6. CONTROLE E PAINEL DE EMPRÉSTIMOS
function FinalizarEmprestimoAutomatico(nomeLeitor) {
    let emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
    const devolucao = new Date();
    devolucao.setDate(devolucao.getDate() + 7);

    emprestimos.push({
        cliente: nomeLeitor,
        livro: livroSelecionado.titulo,
        capa: livroSelecionado.capa,
        dataDevolucao: devolucao.toLocaleDateString("pt-BR")
    });

    localStorage.setItem("emprestimos", JSON.stringify(emprestimos));
    livroSelecionado = null; 

    alert("Empréstimo realizado com sucesso! Redirecionando para seus prazos...");
    window.location.href = "painelEmprestimos.html";
}

function carregarClientesSelect() {
    const select = document.getElementById("clienteSelect");
    if (!select) return; // Proteção contra erros

    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    select.innerHTML = '<option value="">Selecione um cliente...</option>';

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.nome;
        option.textContent = cliente.nome;
        select.appendChild(option);
    });
}

function FinalizarEmprestimo() {
    const selectCliente = document.getElementById("clienteSelect");
    if (!selectCliente) return;

    const cliente = selectCliente.value;

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
    selectCliente.value = "";

    mostrarEmprestimos();
    alert("Empréstimo realizado com sucesso!");
}

function mostrarEmprestimos() {
    const container = document.getElementById("emprestimosAtivos");
    if (!container) return; // Proteção contra erros

    const mapEmprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
    container.innerHTML = "<h3>Empréstimos Ativos</h3>";

    const leitorLogado = localStorage.getItem("leitorLogado");

    // Filtra a lista: Se a Luiza estiver logada, só mostra os dela. Se for admin, mostra tudo.
    const emprestimosFiltrados = mapEmprestimos.filter(emp => {
        if (leitorLogado) {
            return emp.cliente.toLowerCase() === leitorLogado.toLowerCase();
        }
        return true; 
    });

    if (emprestimosFiltrados.length === 0) {
        container.innerHTML += "<p style='color: #94a3b8; font-size: 0.9rem;'>Nenhum empréstimo ativo encontrado.</p>";
        return;
    }

    emprestimosFiltrados.forEach(emp => {
        const card = document.createElement("div");
        card.className = "item-cadastrado";
        card.style.borderLeft = "5px solid #4ade80"; // Mantém a bordinha verde de ativo
        card.style.marginBottom = "10px";
        
        card.innerHTML = `
            <p><strong>Livro:</strong> <span>${emp.livro}</span></p>
            <p><strong>Leitor/Cliente:</strong> <span>${emp.cliente}</span></p>
            <p style="color: #4ade80;"><strong>Devolução até:</strong> ${emp.dataDevolucao}</p>
        `;
        container.appendChild(card);
    });
}