# Relatório de Lógica e Arquitetura do Aplicativo Cuidja

Este documento descreve a arquitetura funcional e o fluxo de dados do aplicativo Cuidja, detalhando os processos de autenticação, compra e venda.

**1. Arquitetura de Dados e Autenticação (Firebase)**

O aplicativo utiliza o Firebase como backend principal, aproveitando dois de seus serviços:

*   **Firebase Authentication:** Gerencia a identidade dos usuários.
    *   **Provedores:** Suporta login/cadastro com E-mail e Senha, Google e Sessões Anônimas (Visitante).
    *   **Coleção `users`:** Ao se cadastrar (via E-mail ou primeiro login com Google), um documento correspondente ao `userId` do usuário é criado na coleção `users`. Este documento armazena informações como nome, e-mail, telefone e uma lista de endereços salvos.

*   **Cloud Firestore (Banco de Dados):**
    *   **`users/{userId}`:** Armazena dados do perfil do usuário.
    *   **`stores/{storeId}`:** Contém informações da loja de um vendedor (nome, logo, horário de funcionamento, etc.), vinculada a um `userId`.
    *   **`products/{productId}`:** Coleção central que armazena tanto **produtos físicos** quanto **serviços**. A distinção é feita pelo campo `category`. Um item com `category: 'Serviços'` é tratado de forma diferente na interface.
    *   **`orders/{orderId}`:** Armazena tanto os **pedidos de compra de produtos** quanto as **solicitações de contato para serviços**. O status inicial (`'Confirmado'` vs. `'Solicitação de Contato'`) diferencia os dois tipos. Esta coleção também contém o chat entre cliente e vendedor.

*   **Regras de Segurança (`firestore.rules`):**
    *   **Proteção de Dados:** As regras garantem que um usuário só pode editar seu próprio perfil e suas próprias lojas/produtos.
    *   **Privacidade dos Pedidos:** Um pedido só pode ser visualizado pelo cliente que o criou e pelo vendedor dono da loja correspondente. Ninguém mais tem acesso.
    *   **Leitura Pública:** A lista de produtos e lojas é pública para que todos os visitantes possam navegar pelo catálogo do aplicativo.

**2. Fluxo do Comprador**

1.  **Navegação:** O usuário (logado ou não) pode navegar pela página inicial, ver produtos em destaque, explorar categorias e buscar por itens específicos.
2.  **Seleção de Produto/Serviço:** Ao clicar em um item, ele é levado para a página de detalhes do produto (`/produtos/[id]`) ou para o checkout do serviço (`/checkout-servico`).
3.  **Adicionar ao Carrinho:**
    *   **Restrição de Loja Única:** O sistema de carrinho (`CartContext`) impõe uma regra crucial: um usuário só pode adicionar itens de **uma única loja por vez**. Se ele tentar adicionar um produto de uma segunda loja, uma notificação de erro o impede, forçando-o a finalizar a compra atual ou esvaziar o carrinho.
    *   **Produtos com Opções:** Se um produto possui "complementos" (como bordas de pizza), uma tela de opções é exibida para personalização antes de adicionar ao carrinho.
4.  **Checkout:**
    *   **Produtos (`/checkout`):** O usuário preenche seus dados de entrega, revisa o pedido e seleciona um método de pagamento simulado (Cartão ou PIX).
    *   **Serviços (`/checkout-servico`):** O processo é simplificado para uma "solicitação de contato". O usuário preenche seus dados e envia uma mensagem inicial opcional.
5.  **Criação do Pedido/Solicitação:** Após o checkout, um novo documento é criado na coleção `orders` com o status apropriado e com a flag `sellerHasUnread: true` para notificar o vendedor.
6.  **Acompanhamento:** O cliente pode ver seus pedidos na tela "Meus Pedidos" e interagir com o vendedor através do chat na página de detalhes do pedido (`/pedidos/[id]`).

**3. Fluxo do Vendedor**

1.  **Primeiro Anúncio (Onboarding de Baixa Fricção):**
    *   Ao acessar a aba "Vender" pela primeira vez, o usuário não é forçado a criar uma loja. Em vez disso, ele é incentivado a criar seu primeiro anúncio.
    *   Ele escolhe entre "Produto" e "Serviço", o que o leva a um formulário simplificado.
2.  **Criação da Loja (Passo Obrigatório Pós-Anúncio):**
    *   **Após** preencher os detalhes do primeiro item e clicar em "Publicar", o usuário é direcionado para uma tela obrigatória para finalizar a criação da sua loja (nome, logo, etc.).
    *   Essa abordagem usa a psicologia de "investimento": o usuário já fez o trabalho de cadastrar um item e está mais motivado a completar o perfil para poder começar a vender.
3.  **Painel do Vendedor:**
    *   Uma vez que a loja está criada, a aba "Vender" se torna o painel de controle do vendedor.
    *   O painel oferece acesso rápido para: criar novos anúncios, gerenciar produtos e serviços existentes (em listas separadas), visualizar pedidos/solicitações e editar os dados da loja.
4.  **Gerenciamento de Pedidos e Solicitações:**
    *   O vendedor é notificado de novas interações.
    *   Na tela de detalhes do pedido (`/pedidos/[id]`), ele pode ver os dados do cliente, alterar o status do pedido (o que notifica o cliente) e conversar diretamente pelo chat.
