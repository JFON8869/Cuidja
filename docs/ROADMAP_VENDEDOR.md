# Roadmap de Evolução - Painel do Vendedor

**Visão Geral:** Transformar o painel "Vender" de um simples gerenciador de itens em uma central de inteligência de negócios para o vendedor, com foco em dados, eficiência e crescimento.

---

### **Sprint 1: Dashboard de Vendas Funcional (Curto Prazo)**

*   **Objetivo Técnico:** Substituir o conteúdo estático por dados reais e dinâmicos, processando a coleção `orders` para fornecer métricas de desempenho.
*   **Justificativa de Negócio:** Fornecer ao vendedor uma visão clara de seu faturamento e volume de pedidos é o primeiro passo para que ele possa tomar decisões informadas para crescer. Um dashboard estático gera desconfiança.
*   **Ações:**
    1.  **Consulta Agregada:** Na página `/vender`, criar uma função que busca os pedidos (`orders`) da loja do usuário nos últimos 30 dias.
    2.  **Cálculo de KPIs:** Processar os dados para calcular:
        *   Faturamento Total (de pedidos com status "Entregue" ou "Concluído").
        *   Número de Novos Pedidos.
        *   Ticket Médio.
    3.  **Atualização dos Cards:** Conectar os KPIs calculados aos cards de métricas no topo do painel.
    4.  **Gráfico de Vendas Real:** Implementar o gráfico (usando `Recharts`), exibindo o faturamento diário ou semanal dos últimos 30 dias.
*   **Risco Mitigado:** Desengajamento do vendedor por falta de ferramentas úteis; incapacidade do vendedor de medir seu próprio sucesso na plataforma.

---

### **Sprint 2: Gestão de Estoque e Disponibilidade (Curto Prazo)**

*   **Objetivo Técnico:** Implementar uma interface de gerenciamento rápido de disponibilidade para produtos e serviços, permitindo que o vendedor atualize múltiplos itens de uma vez.
*   **Justificativa de Negócio:** Reduzir o atrito na gestão diária da loja. Um vendedor que consegue pausar rapidamente um produto esgotado evita vendas canceladas e frustração do cliente.
*   **Ações:**
    1.  **Interface de Gestão Rápida:** Nas páginas `/vender/produtos` e `/vender/servicos`, adicionar um interruptor (switch) de "Disponível / Indisponível" ao lado de cada item da lista.
    2.  **Atualização Otimista:** Ao alternar o interruptor, a UI é atualizada imediatamente, e uma operação `updateDoc` é disparada em segundo plano para alterar o campo `availability` no Firestore.
    3.  **Feedback Visual:** O item na lista mudará visualmente (ex: ficará esmaecido) para refletir seu status de indisponível.
*   **Risco Mitigado:** Vendas de produtos fora de estoque; sobrecarga de solicitações para serviços que o vendedor não pode atender no momento; má reputação da loja por não cumprir pedidos.

---

### **Sprint 3: Notificações em Tempo Real (Médio Prazo)**

*   **Objetivo Técnico:** Implementar notificações Push via Firebase Cloud Messaging (FCM) para alertar os vendedores sobre novos pedidos e mensagens em tempo real.
*   **Justificativa de Negócio:** A velocidade de resposta é crucial, especialmente para pedidos urgentes. Notificações em tempo real aumentam drasticamente a chance de uma venda bem-sucedida e a satisfação do cliente.
*   **Ações:**
    1.  **Cloud Function:** Criar uma Cloud Function que é acionada (`onWrite`) sempre que um novo documento é criado em `orders` com a flag `sellerHasUnread: true`.
    2.  **Lógica da Função:** A função lerá o `sellerId` do pedido, buscará o token de dispositivo (FCM token) salvo no perfil de usuário correspondente e enviará uma notificação push com os detalhes do pedido.
    3.  **Gestão de Tokens no App:** No aplicativo cliente, ao fazer login, solicitar permissão para notificações e salvar o FCM token no documento do usuário no Firestore.
*   **Risco Mitigado:** Demora na confirmação de pedidos; perda de vendas por falta de resposta rápida; má experiência do cliente que fica esperando.
