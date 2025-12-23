# Roadmap Técnico de Alta Performance - Cuidja

**Visão Geral:** Este roadmap define os próximos passos para evoluir a plataforma Cuidja, focando em performance, escalabilidade, segurança e experiência do usuário. Cada sprint é projetado para entregar valor mensurável e mitigar riscos futuros.

---

### **Sprint 1: Otimização de Performance e Monitoramento (Curto Prazo)**

*   **Objetivo Técnico:** Reduzir o tempo de carregamento das páginas, melhorar a percepção de velocidade e estabelecer uma base para monitoramento de performance.
*   **Justificativa de Negócio:** Páginas mais rápidas aumentam a retenção de usuários e a conversão. Monitoramento nos permite identificar gargalos antes que afetem os clientes.
*   **Ações:**
    1.  **Otimização de Imagens:** Implementar a compressão de imagens no momento do upload. Garantir que as imagens servidas pelo `next/image` sejam do menor tamanho possível sem perda de qualidade visual.
    2.  **Code Splitting e Lazy Loading:** Analisar os componentes mais pesados (especialmente em páginas com muitas listagens) e aplicar `React.lazy` para carregá-los apenas quando forem visíveis na tela.
    3.  **Implementar Vitals:** Integrar as métricas de Core Web Vitals do Next.js para monitorar a performance real da aplicação em produção.
*   **Risco Mitigado:** Abandono de carrinho por lentidão; má classificação em mecanismos de busca (SEO); incapacidade de diagnosticar problemas de performance.

---

### **Sprint 2: Segurança Avançada e Confiança (Curto Prazo)**

*   **Objetivo Técnico:** Fortalecer a segurança da autenticação e das transações, protegendo contas de usuários e dados sensíveis.
*   **Justificativa de Negócio:** Aumentar a confiança do usuário na plataforma é crucial para incentivar transações financeiras e o compartilhamento de dados.
*   **Ações:**
    1.  **Autenticação de Dois Fatores (2FA):** Implementar a opção de 2FA (via e-mail ou app de autenticação) para aumentar a segurança das contas.
    2.  **Validação de Input no Backend:** Embora o formulário no frontend tenha validação, implementar uma camada de validação do lado do servidor (usando Cloud Functions) para todas as operações de escrita no Firestore, como uma segunda linha de defesa.
    3.  **Auditoria de Logs:** Configurar logs de auditoria para ações críticas (ex: mudança de status de pedido, alteração de preço), registrando qual usuário realizou a ação e quando.
*   **Risco Mitigado:** Acesso não autorizado a contas; manipulação de dados por requisições maliciosas; fraude em pedidos.

---

### **Sprint 3: Escalabilidade do Catálogo e Busca (Médio Prazo)**

*   **Objetivo Técnico:** Preparar o sistema para um grande volume de produtos e vendedores, garantindo que a busca e a navegação continuem rápidas.
*   **Justificativa de Negócio:** Conforme o marketplace cresce, a incapacidade de encontrar produtos rapidamente se torna o principal ponto de abandono.
*   **Ações:**
    1.  **Implementar Busca com Algolia/Typesense:** Substituir a busca nativa do Firestore (que tem limitações de performance e complexidade) por um serviço de busca dedicado como Algolia ou Typesense. Isso permite filtros complexos, busca por texto completo e resultados instantâneos.
    2.  **Paginação em Todas as Listagens:** Garantir que todas as telas de listagem de produtos, lojas e pedidos implementem paginação ou "scroll infinito" para evitar carregar milhares de documentos de uma só vez.
    3.  **Cache Inteligente de Dados:** Implementar uma estratégia de cache no lado do cliente para dados que não mudam com frequência (ex: lista de categorias, detalhes de lojas populares).
*   **Risco Mitigado:** Lentidão extrema e timeouts em listagens e buscas; experiência de usuário frustrante com o crescimento do catálogo.

---

### **Sprint 4: Refinamento da Experiência do Vendedor (Médio Prazo)**

*   **Objetivo Técnico:** Fornecer aos vendedores ferramentas melhores para gerenciar suas operações e entender seu desempenho.
*   **Justificativa de Negócio:** Um vendedor bem-sucedido e engajado é a espinha dorsal do marketplace.
*   **Ações:**
    1.  **Dashboard de Vendas Real:** Substituir os dados estáticos do gráfico de vendas por dados reais, processados a partir da coleção `orders`.
    2.  **Gestão de Estoque Simplificada:** Criar uma interface rápida no painel do vendedor para que ele possa atualizar a disponibilidade (`available`, `unavailable`) de múltiplos produtos de uma vez.
    3.  **Notificações Push:** Implementar notificações push (além das notificações internas) para alertar os vendedores sobre novos pedidos em tempo real, mesmo com o app fechado.
*   **Risco Mitigado:** Vendedores desengajados; falha no cumprimento de pedidos por falta de ferramentas; perda de vendas por demora na resposta.
