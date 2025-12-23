# Roteiro Rápido: Como Funciona o Setor de Vendas no Cuidja

Este guia descreve o passo a passo para um usuário se tornar um vendedor e gerenciar suas vendas na plataforma.

**1. O Pré-requisito: Ter uma Conta**
- Antes de tudo, o usuário precisa ter uma conta no aplicativo, seja via e-mail e senha ou login com Google.

**2. Tornando-se um Vendedor: A Criação da Loja**
- **Início:** O processo começa na aba **"Vender"** do menu principal.
- **Primeiro Passo:** Se o usuário ainda não for um vendedor, o aplicativo o direcionará para uma tela onde ele deve **criar sua loja**.
- **Dados da Loja:** Neste ponto (`/vender/loja`), ele cadastra as informações essenciais:
    - **Nome da Loja:** O nome que aparecerá para os clientes.
    - **Logo:** Uma imagem para representar a marca.
    - **Horário de Funcionamento:** Ele pode definir os dias e horários em que a loja está aberta, o que será exibido para os compradores.

**3. O Painel do Vendedor: A Central de Controle**
- Uma vez que a loja está criada, a aba "Vender" se transforma no **Painel do Vendedor**.
- Este painel é o hub central e oferece acesso rápido a todas as funções de gerenciamento:
    - **Anunciar Novo Item:** Botão principal para cadastrar produtos ou serviços.
    - **Gerenciar Loja:** Link para editar os dados da loja (nome, logo, horários).
    - **Meus Produtos:** Acesso à lista de produtos físicos cadastrados.
    - **Meus Serviços:** Acesso à lista de serviços oferecidos.
    - **Minhas Vendas:** Histórico de todos os pedidos e vendas realizadas.

**4. Anunciando Itens (Produtos e Serviços)**
- **Formulário Unificado:** Clicando em "Anunciar Novo Item" (`/vender/novo-produto`), o vendedor acessa um formulário inteligente.
- **Diferenciação por Categoria:**
    - Se ele escolher uma categoria como "Restaurantes" ou "Artesanatos", o formulário se apresenta como um **cadastro de produto**, com campos para preço, complementos opcionais (ex: borda de pizza, molho extra) e disponibilidade de estoque.
    - Se ele escolher a categoria **"Serviços"**, o formulário se adapta:
        - O campo de "Complementos" é ocultado.
        - O rótulo "Preço" muda para **"Taxa de Visita/Contato"**, deixando claro que é um valor inicial.
- **Dados do Item:** O vendedor preenche nome, descrição, fotos e o valor.

**5. Gerenciando Itens Anunciados**
- **Listas Separadas:** No painel, o vendedor pode ir para "Meus Produtos" ou "Meus Serviços" para ver seus itens.
- **Ações:** Em cada item listado, ele tem as opções de **Editar** (que o leva de volta ao formulário preenchido) ou **Excluir**.

**6. Recebendo e Gerenciando Pedidos**
- **Notificações:** Quando um cliente faz uma compra ou solicita um serviço, o vendedor recebe uma notificação (um alerta visual no ícone "Notificações" e na aba "Vendas").
- **Tipos de Pedido:**
    - **Compra de Produto:** Gera um pedido com status inicial como "Confirmado" (após o "pagamento" simulado).
    - **Solicitação de Serviço:** Gera um pedido com status inicial **"Solicitação de Contato"**.
- **Página de Detalhe do Pedido (`/pedidos/[id]`):** Esta é a tela principal de gerenciamento. Aqui o vendedor pode:
    - **Ver os Dados do Cliente:** Nome, endereço de entrega e telefone.
    - **Atualizar o Status:** Mudar o status do pedido (ex: de "Confirmado" para "Em Preparo", "Saiu para Entrega", etc.). Cada mudança notifica o cliente.
    - **Comunicar-se via Chat:** Trocar mensagens diretamente com o cliente para combinar detalhes.

Em resumo, a lógica é criar uma barreira inicial (criar uma loja) para se tornar vendedor e, a partir daí, oferecer um painel centralizado para que ele possa gerenciar seu "catálogo" (produtos/serviços) e suas interações com os clientes (pedidos/chat) de forma organizada.
