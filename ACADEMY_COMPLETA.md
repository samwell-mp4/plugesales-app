# Academy Plug & Sales - Documentação Oficial Completa

Esta é a documentação completa e detalhada de todo o funcionamento da plataforma **Plug & Sales**, dividida por perfis de acesso. O objetivo deste manual é guiar o usuário desde os primeiros passos até a resolução de problemas comuns.

---

## ÍNDICE

1. **[Perfil: Funcionário (Operacional)](#1-perfil-funcionário-operacional)**
   - 1.1 Upload e Gestão de Contatos
   - 1.2 Criação e Aprovação de Templates
   - 1.3 Planejamento de Campanhas
   - 1.4 Execução e Disparo Ativo
   - 1.5 Troubleshooting (Resolução de Problemas)
2. **[Perfil: Contabilidade / Financeiro](#2-perfil-contabilidade--financeiro)**
   - 2.1 Visão Geral do Caixa (Dashboard)
   - 2.2 Gestão de Vendas
   - 2.3 Controle de Pagamentos e Fornecedores
   - 2.4 Comissões
   - 2.5 Reembolsos e Auditorias
3. **[Perfil: Cliente Final](#3-perfil-cliente-final)**
   - 3.1 Acessando o Dashboard
   - 3.2 Lendo Relatórios de Resultados
   - 3.3 Formulários e Submissões (Briefings)
   - 3.4 Estatísticas de Encurtador de Links e Rotacionador
   - 3.5 Criação de Smart Bio e Cartão Digital
4. **[Perfil: Administrador (Gestão)](#4-perfil-administrador-gestão)**
   - 4.1 CRM e Funil de Vendas
   - 4.2 Central de Fluxo de Leads
   - 4.3 Gestão Consultiva e Retenção
   - 4.4 Controle de Acessos e Usuários
   - 4.5 Monitoramento N8N e Plug Cards

---

## 1. Perfil: Funcionário (Operacional)

Este módulo foca na operação diária do sistema, especificamente no disparo em massa de mensagens de WhatsApp.

### 1.1 Upload e Gestão de Contatos

A base do disparo é a lista de clientes. Se a lista estiver formatada incorretamente, a plataforma rejeitará o envio ou as mensagens falharão.

**Regras de Formatação da Planilha:**
- O arquivo deve ser `.csv` ou `.xlsx`.
- Deve existir uma coluna contendo os números de telefone.
- **Formato Obrigatório:** O telefone precisa conter o DDI (Ex: Brasil é `55`). Um número de São Paulo com o nono dígito seria `5511999999999`.

**Passo a Passo:**
1. No menu lateral, acesse **Upload Clientes**.
2. Clique na área pontilhada para buscar o arquivo no computador ou arraste-o.
3. Na tela de mapeamento, o sistema pedirá para você associar as colunas da planilha aos campos internos.
   - *Nome* -> Associar à coluna de Nome.
   - *Telefone* -> Associar à coluna do Número.
4. Clique em **Importar**. O sistema fará a limpeza (retirar duplicatas e caracteres especiais).

### 1.2 Criação e Aprovação de Templates

A API Oficial do WhatsApp exige que a primeira mensagem enviada (para abrir a janela de 24 horas) seja um template previamente aprovado pela Meta.

**Regras de Boas Práticas (Meta):**
- Proibido linguagem abusiva, promessas irreais de ganhos financeiros ou venda de produtos ilícitos.
- Textos devem ser cordiais. Evite CAIXA ALTA excessiva.
- É recomendado o uso do Opt-Out (ex: "Digite SAIR para não receber mais nossas mensagens").

**Passo a Passo:**
1. Acesse o menu **Criar Template**.
2. Selecione a Categoria: `Marketing`, `Utility` (Utilidade) ou `Authentication` (Autenticação). Na maioria dos casos, selecione `Marketing`.
3. Escreva a mensagem. Para inserir o nome do cliente dinamicamente, use as variáveis `{{1}}`, `{{2}}`.
4. (Opcional) Adicione Cabeçalho (Imagem/Vídeo) e Botões (Call to Action ou Resposta Rápida).
5. Envie para aprovação. O status ficará como `PENDING`. Em até 24 horas, a Meta muda para `APPROVED` ou `REJECTED`.

### 1.3 Planejamento de Campanhas

Após a aprovação do template, você precisa agendar o disparo.

**Passo a Passo:**
1. Acesse **Campaign Planner**.
2. Escolha o grupo de contatos importado anteriormente.
3. Selecione o Template aprovado. Se houver variáveis (`{{1}}`), o sistema perguntará de qual coluna ele deve puxar a informação (geralmente a coluna `Nome`).
4. Selecione a data e o horário do envio.
5. Salve a campanha.

### 1.4 Execução e Disparo Ativo

Para iniciar o motor de disparos:
1. Acesse **Monitor e Disparo (Template Dispatch)**.
2. Na lista de campanhas, clique em **Play/Iniciar**.
3. A barra de progresso mostrará o envio em tempo real. O sistema processa os envios em lotes. Não feche a aba principal caso o sistema alerte que a aba precisa ficar aberta para forçar o cron job local.

### 1.5 Troubleshooting (Resolução de Problemas Comuns)

- **Erro "Invalid Parameter" no Envio:** Significa que as variáveis do template não foram mapeadas corretamente. O WhatsApp não envia se você passar uma variável vazia ou no formato errado.
- **Lista não sobe no Upload:** Verifique se há acentos no cabeçalho da planilha ou linhas em branco no final do arquivo Excel.
- **Template Rejeitado:** A Meta identificou infração da política de comércio. Revise os termos, retire excesso de promoções agressivas e tente novamente.

---

## 2. Perfil: Contabilidade / Financeiro

Responsável pelo fluxo de caixa, pagamentos e repasses (comissões).

### 2.1 Visão Geral do Caixa (Dashboard)

1. Acesse **Painel Geral (Finance Dashboard)**.
2. Este painel mostra os Cards de Receita Bruta, Receita Líquida (após comissões), Despesas Fixas e Lucro.
3. Utilize os filtros de data no topo direito para alterar o mês de competência.

### 2.2 Gestão de Vendas

Todo cliente fechado pelo time comercial deve ser registrado aqui.

1. Acesse **Cadastro de Vendas**.
2. Clique em "Nova Venda". Preencha o nome do cliente, o plano escolhido, o valor total e quem foi o vendedor responsável.
3. A inserção de uma venda gera automaticamente um *provento* e uma *previsão de comissão* (Contas a Pagar).

### 2.3 Controle de Pagamentos e Fornecedores

1. Em **Fornecedores**, cadastre parceiros, plataformas (ex: Meta, servidores AWS) e prestadores de serviço.
2. Em **Contas a Pagar**, crie as despesas mensais. O status inicia como `A Vencer`. 
3. Assim que o pagamento for realizado no banco, o financeiro deve acessar a conta a pagar e clicar no botão de "Dar Baixa" (Mudar status para `Pago`), anexando o comprovante se necessário.

### 2.4 Comissões

1. Acesse **Comissões**. 
2. Aqui constarão todas as comissões geradas pelos vendedores a partir do Módulo de Vendas.
3. Ao fim do mês, o financeiro filtra pelo nome do vendedor, consolida o valor e executa o pagamento, alterando o status para `Pago`.

### 2.5 Reembolsos e Auditorias

1. Caso um cliente solicite cancelamento e estorno, acesse **Reembolsos**.
2. Essa área reverte a venda no painel de relatórios (estornando a receita bruta e as comissões ainda não pagas).
3. Para auditoria final do caixa, use a tela **Controle Financeiro**, que faz a conciliação de tudo o que entrou versus tudo o que saiu.

---

## 3. Perfil: Cliente Final

A interface que o cliente que contratou a Plug & Sales acessa para ver o valor que o serviço está gerando.

### 3.1 Acessando o Dashboard

1. Ao fazer login, o cliente cai no **Client Dashboard**.
2. Aqui existe um resumo claro de Campanhas Ativas, Mensagens Entregues no Mês e Custo Estimado.
3. O cliente possui restrição e não pode acessar as abas administrativas.

### 3.2 Lendo Relatórios de Resultados

1. Vá em **Relatórios**.
2. O cliente escolhe a campanha desejada.
3. Ele poderá ver as métricas fundamentais:
   - **Enviados:** O sistema enviou.
   - **Entregues:** O WhatsApp confirmou que o cliente recebeu (dois checks).
   - **Lidos:** O cliente abriu o WhatsApp e leu a mensagem (dois checks azuis).
   - **Falhas:** Números inválidos ou contas de WhatsApp inexistentes.

### 3.3 Formulários e Submissões (Briefings)

Para solicitar novas campanhas à agência:
1. Acesse **Formulários / Uploads (Client External Form)**.
2. O cliente preenche o briefing: qual o objetivo da nova campanha, manda as imagens/mídias anexas e descreve o público.
3. Essa submissão vai para o painel dos funcionários para execução.

### 3.4 Estatísticas de Encurtador de Links e Rotacionador

A Plug & Sales fornece ferramentas de conversão para o cliente:
- **Encurtador de Link:** Em **Ferramentas de Link**, o cliente pode pegar um link grande e deixá-lo curto.
- Em **Estatísticas (Link Stats)**, ele consegue ver: a quantidade de cliques, quais navegadores os leads usaram (Mobile vs Desktop) e qual foi a origem (Instagram, WhatsApp, Direto).
- **Rotacionador:** Usado para times de vendas. Se o cliente tiver 3 atendentes, ele cria 1 link rotativo. O sistema joga um clique para o Atendente A, o próximo para o B, e assim por diante.

### 3.5 Criação de Smart Bio e Cartão Digital

Para melhorar a presença online do cliente:
- Em **Smart Bio**, ele pode montar uma página de links (estilo Linktree) customizada com a marca dele, botões de WhatsApp e redes sociais.
- Em **Cartão Digital**, ele preenche os dados e o sistema gera um arquivo PDF interativo, onde os ícones são clicáveis para enviar para os leads.

---

## 4. Perfil: Administrador (Gestão)

Focado na governança da Plug & Sales.

### 4.1 CRM e Funil de Vendas

Para gerenciar o processo comercial interno da Plug & Sales:
1. Acesse **Clientes & Funil**.
2. Você verá um quadro Kanban (estilo Trello) com as colunas: `Lead Entrou`, `Contato Inicial`, `Reunião Agendada`, `Proposta Enviada` e `Fechado`.
3. Você pode arrastar os cards para avançar os negócios e clicar no card para colocar anotações da reunião com o cliente.

### 4.2 Central de Fluxo de Leads

1. Acessada via **Central Fluxo Leads**.
2. Ferramenta exclusiva de auditoria. Ela alerta com cores (Vermelho, Amarelo) quando um vendedor abandona um Lead no funil por mais de "X" dias sem nenhum tipo de contato ou avanço, garantindo que nenhum cliente fique sem resposta.

### 4.3 Gestão Consultiva e Retenção

1. A **Gestão Consultiva** é usada pelo time de Sucesso do Cliente (CS).
2. Permite cadastrar reuniões periódicas com os clientes ativos.
3. Avalia o humor do cliente (Satisfeito, Neutro, Risco de Churn) para tomar decisões estratégicas antes do cliente pedir cancelamento.

### 4.4 Controle de Acessos e Usuários

1. Vá em **Controle Adm**.
2. Aqui o Administrador cadastra novos membros na equipe.
3. Regras de Permissão:
   - `EMPLOYEE`: Acesso operacional, não vê financeiro, mas vê CRM e ferramentas de disparo.
   - `CONTABILIDADE`: Vê apenas finanças e não mexe em disparos nem clientes.
   - `VENDEDOR`: Acesso ao CRM e registro de Vendas (para ver comissões).
   - `CLIENT`: Acesso estrito e fechado à própria dashboard.
   - `ADMIN`: Acesso irrestrito.

### 4.5 Monitoramento N8N e Plug Cards

- O **Monitor de Banco / N8N Monitor** é o núcleo de integração. O Administrador pode ver se os webhooks e fluxos automatizados do n8n (que escutam as notificações da Meta e atualizam status de mensagem) estão online e rodando.
- A área de **Plug Cards (Gestão e Marketplace)** é o ambiente onde o gestor cadastra novos templates de design de cartões digitais ou links que ficam disponíveis para os usuários "comprarem/usarem" em suas próprias contas.
