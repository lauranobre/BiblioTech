### 1. HTML - Estrutura:

- Gestão de Clientes: Formulário para cadastrar nome, email e CPF. O botão "Cadastrar Cliente" aciona a função CadastrarCliente().
- Busca de Livros: Um campo de texto para digitar o nome do livro e um botão "Buscar Livro" que aciona a função buscarLivroAPI(). Os resultados aparecem em cards com um botão "Selecionar" para escolher o livro.
- Empréstimos: Um select para escolher o cliente e uma div para mostrar os livros disponíveis. O botão "Finalizar Empréstimo" aciona a função FinalizarEmprestimo().

-> No final da gestão de clientes e do controle de empréstimos, os usuários cadastrados e os empréstimos controlados são exibidos

-> Na sção de controle de empréstimos, eu vou juntar o cadastro de clientes da parte A com o livro escolhido da parte B (busca na API)


2. 
### 2. JAVASCRIPT - Lógica e Funcionamento:

- GERAIS 
A parte do window.onload executa assim que a página carregar na tela, buscando as informações salvas

JSON.parse() - transforma o texto salvo em um array
JSON.stringify() - transforma a lista do JS em um texto no momento de salvar

- GESTÃO DE CLIENTES
Na função de CadastrarCliente() - os valores são preenchidos e armazenados em variável de clientes
O document.getElmentById('nome').value = ''; faz com que os campos do formulário que foram preenchidos fiquem vazios novamente

- BUSCA DE LIVROS (API Externa)
A async function buscarLivroAPI busca o livro usando o await fetch na minha API externa
(async - sempre retornará uma promessa)
(await - avisa que a execução daquela função está ocorrendo)

livro.title.replace(/'/g, "\\'"): Alguns livros possuem aspas simples no título em inglês (ex: Harry Potter's). Se jogássemos isso direto no HTML do botão de selecionar, a aspa do título fecharia o código do JavaScript antes da hora e quebraria o clique. Esse comando coloca uma barra invertida antes das aspas para o navegador entender que é apenas texto.


- CONTROLE DE EMPRÉSTIMOS   
carregarClientesSelect(): os clientes estão cadastrados, eu seleciono a opção de um cliente para finalizar o meu cadastro

function FinalizarEmprestimo(): pega o meu cliente selecionado junto com o emprestimo para calcular a data de devolução e com quem o livro buscado vai estar 

Após a validação, se tudo estiver certo ele calcula a data de devolução (soma a data atual + 7), e salva a data de devolução na "impressão" do LocalStorage