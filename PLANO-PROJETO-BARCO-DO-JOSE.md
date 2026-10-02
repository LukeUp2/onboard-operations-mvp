# Projeto Barco do José — plano preliminar

**Status:** MVP web de validação publicado — aguardando teste e feedback do cliente.

**Data da versão:** 1.º de outubro de 2026.

Este documento é um plano vivo. Ele registra o que foi entendido até agora, as hipóteses que precisam ser validadas e uma arquitetura candidata para orientar a próxima conversa com o cliente.

**MVP atual:** [barco-jose-mvp.vercel.app](https://barco-jose-mvp.vercel.app). Ele usa dados fictícios, não possui login e persiste alterações apenas no navegador para demonstrar os fluxos. Não representa ainda o backend definitivo, a sincronização real ou a integração física com impressoras.

## 1. Entendimento atual

O sistema poderá apoiar três operações do barco:

1. **Encomendas:** registrar remetente, destinatário, endereço ou localidade, cidade, rota, características do volume, situação da entrega, cobrança e impressão de etiqueta.
2. **Mercadinho:** cadastrar produtos, preços, estoque, entradas, perdas, ajustes, vendas e relatórios.
3. **Suítes:** cadastrar quartos, consultar disponibilidade, criar e acompanhar reservas, registrar hóspedes, entrada, saída e situação de cada suíte.

O problema transversal é a conectividade: o barco pode passar períodos sem sinal. Portanto, o sistema precisa continuar permitindo as operações essenciais sem internet e sincronizar os dados quando a conexão voltar.

## 2. Hipóteses que ainda não são requisitos

- O operador atualmente anota parte das informações em papel e depois transcreve para uma etiqueta.
- O fluxo mais crítico é cadastrar uma encomenda rapidamente e imprimir uma etiqueta legível.
- Pode haver mais de um usuário e mais de um dispositivo, mas isso ainda não foi confirmado.
- O barco pode ter uma rede Wi-Fi local mesmo quando não tem internet; isso precisa ser testado.
- O mercado e as suítes podem compartilhar pessoas, usuários, pagamentos, relatórios e cadastro de localidades.
- A impressão poderá ocorrer em uma impressora comum ou térmica, mas marca, modelo, conexão e tamanho da etiqueta são desconhecidos.
- Não se deve presumir, antes da entrevista, requisitos fiscais, emissão de documento fiscal, integração bancária, cartão, PIX, marketplace ou integração com empresas de transporte.

## 3. Recomendação técnica inicial

### Arquitetura candidata

```text
Aplicação no dispositivo
  ├─ interface nativa/híbrida
  ├─ banco SQLite local
  ├─ fila local de alterações (outbox)
  ├─ impressão de etiquetas e relatórios
  └─ funcionamento offline
          │ quando houver rede
          ▼
API ASP.NET Core
  ├─ autenticação e autorização
  ├─ regras de negócio
  ├─ sincronização idempotente
  ├─ auditoria e relatórios
  └─ banco central relacional
          │
          ▼
Banco central gerenciado
  └─ PostgreSQL ou SQL Server, decisão posterior
```

Minha recomendação para iniciar a validação é:

- **Backend:** C# com ASP.NET Core sobre **.NET 10 LTS**, usando APIs HTTP, validação, autenticação, autorização e observabilidade.
- **Domínio:** arquitetura modular, com regras de negócio isoladas da interface e da infraestrutura. DDD pode ser aplicado de forma pragmática, principalmente nos módulos de encomendas, estoque e reservas; não é necessário começar com uma solução excessivamente complexa.
- **Persistência local:** SQLite por dispositivo, com transações, migrações e uma fila de sincronização.
- **Banco central:** PostgreSQL como primeira hipótese por custo, portabilidade e bom suporte relacional; SQL Server permanece uma alternativa válida se o ambiente do cliente já for Microsoft.
- **Interface:** .NET MAUI Blazor Hybrid se houver necessidade de Windows e Android ou de possível expansão para outros dispositivos. A mesma interface poderá ser reaproveitada em uma versão web, se isso fizer sentido.
- **Somente Windows:** se o cliente confirmar que haverá apenas computadores Windows e integração intensa com impressoras, uma aplicação WinUI 3 pode ser considerada. WPF só deve ser escolhido por compatibilidade ou preferência operacional, não como padrão novo.

O .NET 10 aparece atualmente como versão LTS ativa, com suporte indicado até 14 de novembro de 2028. O .NET 11 ainda está em fase de lançamento preliminar na data deste plano; por isso, a primeira versão de produção não deve depender dele sem uma decisão posterior de atualização.

## 4.1. Estratégia recomendada de validação na Vercel

Sim, faz sentido começar por uma **aplicação web de demonstração** publicada na Vercel. Esse será o caminho mais rápido para enviar um link ao cliente e validar se o fluxo, os nomes dos campos, as telas e a ordem das operações fazem sentido antes de investir na implantação offline.

Essa primeira entrega deve ser chamada de **protótipo funcional navegável** ou **MVP de validação**, não de sistema de produção. Ela poderá ter:

- dashboard simples;
- fluxo de recebimento de encomenda;
- lista, detalhe e alteração de status;
- pré-visualização de etiqueta;
- telas iniciais do mercadinho;
- consulta de suítes e criação simulada de reserva;
- dados fictícios e controlados;
- modo demonstração claramente identificado;
- botões ou indicadores simulando “offline”, “pendente” e “sincronizado”.

Na primeira versão, não é necessário conectar imediatamente um banco de produção nem implementar toda a sincronização real. O objetivo é responder: **o operador entende a tela, consegue completar o trabalho e o cliente aprova o fluxo?**

### O que pode ser reaproveitado depois

- fluxos validados com o cliente;
- nomes e contratos dos dados;
- regras de negócio descobertas;
- componentes visuais e padrões de interação, se a interface final continuar web ou Blazor;
- casos de teste e critérios de aceite;
- identidade visual e materiais de demonstração.

### O que não deve ser prometido como reaproveitamento automático

Uma interface construída em Next.js/React não se transforma automaticamente em uma aplicação .NET MAUI ou WinUI. Se escolhermos Next.js para acelerar o protótipo, provavelmente reaproveitaremos principalmente conhecimento, fluxos e especificações, e não todo o código visual.

Se a prioridade for reaproveitar mais código de interface em uma futura aplicação nativa, poderemos fazer o protótipo com **Blazor WebAssembly/PWA** e depois avaliar **Blazor Hybrid com .NET MAUI**. Se a prioridade for velocidade e qualidade da validação visual, **Next.js/React na Vercel** é uma escolha prática. Essa decisão pode ser tomada depois de confirmar qual dispositivo o cliente usará para testar.

### Limites importantes do protótipo

- Não usar dados reais de clientes, hóspedes ou encomendas.
- Não apresentar o protótipo como solução offline pronta.
- Não garantir impressão física até conhecer o modelo da impressora.
- Não implementar pagamentos, requisitos fiscais ou autenticação definitiva antes da especificação.
- Não criar uma falsa sensação de sincronização: o modo simulado deve ser visualmente identificado.

### Etapas de validação

1. Criar o protótipo web com dados fictícios.
2. Publicar uma versão de demonstração na Vercel.
3. Enviar o link ao cliente e, se necessário, fornecer um roteiro curto de teste.
4. Observar onde ele hesita, corrige termos ou propõe outra sequência.
5. Registrar feedback como requisito, dúvida ou mudança de escopo.
6. Escolher a plataforma definitiva somente depois dessa validação.

Portanto, a Vercel pode ser o **ambiente de validação do produto**. Ela não precisa ser o ambiente final do aplicativo offline, embora a aplicação web também possa evoluir para uma PWA instalável. Uma PWA continua dependendo de armazenamento local, service worker, tratamento de autenticação offline e sincronização; publicar o front-end na Vercel, por si só, não resolve esses pontos.

## 5. Alternativas de produto

| Alternativa | Quando faz sentido | Vantagens | Riscos ou limites |
|---|---|---|---|
| **A. Aplicação nativa/híbrida offline-first** | Operação crítica em um ou mais dispositivos | Melhor acesso a SQLite, impressoras, arquivos e recursos do dispositivo; funciona sem internet | Exige instalação e atualização dos dispositivos; sincronização precisa ser projetada |
| **B. PWA Blazor WebAssembly offline-first** | Equipe quer instalação simples e uso principalmente em navegador | Pode ser instalada como aplicativo e funcionar offline após o primeiro carregamento | IndexedDB, armazenamento do navegador, autenticação offline, impressão e sincronização exigem mais cuidados; o usuário pode apagar os dados do navegador |
| **C. Servidor local no barco + clientes** | Vários operadores precisam ver os mesmos dados simultaneamente | Dados compartilhados na rede local mesmo sem internet; reduz conflitos entre dispositivos conectados ao barco | Requer um computador/mini-servidor ligado, rede local, backup e operação de contingência |
| **D. Desktop isolado, sem nuvem na primeira fase** | Apenas um computador e baixa necessidade de acesso externo | Mais simples, barato e confiável para o início | Não oferece visão centralizada, acesso remoto nem sincronização entre dispositivos |

### Escolha provisória

Começar pelo cenário **A**, mantendo uma evolução possível para o cenário **C**. Se a operação confirmar que apenas um computador é usado, o sistema poderá iniciar sem servidor local. Se houver vários dispositivos trabalhando simultaneamente, será necessário decidir entre um servidor local no barco e sincronização entre clientes.

Não recomendo começar com Blazor Server ou outra aplicação que dependa de uma conexão contínua com o servidor: quando a ligação cair, a interface e as operações que dependem do servidor deixarão de funcionar. Uma PWA ou uma aplicação híbrida pode funcionar offline, mas isso só acontece quando os dados e as regras necessárias também estiverem no dispositivo.

## 6. Offline, sincronização e conflitos

Offline não é apenas “guardar uma cópia da tela”. O dispositivo precisa ter uma fonte local de dados e registrar todas as alterações feitas sem rede.

### Fluxo proposto

1. O operador cria ou altera um registro.
2. A aplicação valida a regra localmente e grava a operação em uma transação SQLite.
3. A operação recebe um identificador único, dispositivo, usuário, horário local/UTC e versão do registro.
4. A etiqueta ou o comprovante pode ser impresso imediatamente.
5. Quando houver conexão, a aplicação envia operações pendentes para a API.
6. A API processa cada operação de forma idempotente, confirma o que foi aceito e devolve conflitos ou erros compreensíveis.
7. A aplicação baixa as alterações feitas por outros dispositivos.
8. O usuário vê um estado claro: **sincronizado**, **pendente**, **conflito** ou **erro que exige ação**.

### Regras de conflito por módulo

- **Encomendas:** usar eventos de status e não apenas sobrescrever o último valor. Alterações incompatíveis, como dois dispositivos mudando a mesma encomenda para destinos diferentes, devem gerar conflito para revisão.
- **Estoque:** não sincronizar simplesmente o “saldo final”. Registrar movimentos de entrada, saída, perda, ajuste e venda. O saldo é calculado a partir dos movimentos aceitos.
- **Suítes:** impedir dupla reserva no servidor. Se dois dispositivos reservarem a mesma suíte offline, uma reserva será confirmada e a outra ficará pendente de resolução. Se a operação não puder tolerar esse risco, a reserva deverá exigir sincronização antes da confirmação ou usar uma política de distribuição temporária de inventário.
- **Cadastros de apoio:** permitir sincronização por versão, com preferência pela versão central e histórico da alteração.
- **Exclusões:** usar exclusão lógica ou tombstones para que um dispositivo offline não faça reaparecer um registro apagado em outro.
- **Numeração de etiquetas e reservas:** usar identificadores globais independentes do contador local, evitando colisões entre dispositivos.

Não se deve copiar o arquivo SQLite de um dispositivo para outro nem tratá-lo como banco compartilhado em uma pasta de rede. A sincronização deve ocorrer por operações de domínio e contratos de API.

## 7. Módulos iniciais e possíveis entidades

### Núcleo compartilhado

- Usuário, perfil e permissões.
- Dispositivo e estado de sincronização.
- Localidade, cidade, porto, rota e ponto de atendimento.
- Auditoria de alterações.
- Configurações da operação e da impressora.

### Encomendas

- Encomenda.
- Remetente e destinatário.
- Endereço ou referência de entrega.
- Volume, peso, dimensões e observações.
- Rota e destino.
- Cobrança e situação do pagamento, se aplicável.
- Etiqueta e histórico de impressão.
- Histórico de movimentação: recebida, etiquetada, embarcada, em trânsito, entregue, devolvida, cancelada ou outra situação definida pelo cliente.

### Mercadinho

- Produto, categoria, unidade de medida e código.
- Preço vigente e histórico de preços.
- Estoque por local.
- Movimento de estoque.
- Venda, itens, descontos e forma de pagamento, se aplicável.
- Perdas, validade e inventário, caso façam parte da operação real.

### Suítes

- Suíte, capacidade, categoria e situação.
- Hóspede ou responsável pela reserva.
- Reserva, período, quantidade de ocupantes e situação.
- Check-in, check-out, limpeza e manutenção, se aplicável.
- Valor, pagamento e observações, se aplicável.

Esses nomes são um ponto de partida para conversar com o cliente, não um modelo de banco aprovado.

## 8. Impressão e operação de encomendas

O primeiro protótipo deve validar a operação completa:

```text
Receber encomenda → preencher dados → revisar → salvar offline
→ gerar número → imprimir etiqueta → registrar impressão
→ sincronizar quando houver conexão
```

Antes de escolher biblioteca ou impressora, precisamos descobrir:

- tamanho exato da etiqueta;
- impressora térmica, laser ou jato de tinta;
- conexão USB, Bluetooth, Wi-Fi ou rede local;
- necessidade de código de barras ou QR Code;
- campos obrigatórios e tamanho máximo de cada texto;
- possibilidade de reimpressão;
- procedimento quando a impressora estiver desligada;
- necessidade de imprimir duas vias ou um comprovante para o remetente.

O sistema deve permitir reimprimir uma etiqueta pelo identificador da encomenda sem criar uma segunda encomenda.

## 9. Segurança, continuidade e dados

- Perfis separados para administração, atendimento de encomendas, estoque, hospedagem e consulta.
- Princípio do menor privilégio.
- PIN ou credencial local para uso offline, com expiração e revogação quando houver conexão.
- Banco local protegido e backup cifrado quando o dispositivo permitir.
- Auditoria de criação, alteração, cancelamento, impressão, sincronização e resolução de conflito.
- Nenhum armazenamento de dados completos de cartão.
- Retenção e acesso a dados pessoais definidos com o cliente, observando a LGPD e a necessidade operacional.
- Exportação controlada para CSV/PDF e restauração testada.
- Backup central automático e cópia local/externa para o caso de falha do dispositivo.
- Indicador visível de sincronização; o usuário nunca deve acreditar que um dado chegou à nuvem quando ainda está apenas no dispositivo.
- Testes com desligamento abrupto, bateria baixa, impressora indisponível, banco cheio, relógio incorreto, sinal intermitente e duas operações simultâneas.

## 10. Plano de execução por fases

### Fase 0 — descoberta e especificação

**Entregáveis:** mapa de processos, glossário, papéis, lista de campos, matriz de regras, mapa de dispositivos/conectividade, decisão inicial de implantação e backlog priorizado.

**Critério de aceite:** o cliente consegue revisar e confirmar como uma encomenda, uma venda e uma reserva acontecem hoje, incluindo exceções.

### Fase 1 — protótipo operacional de encomendas

**Entregáveis:** cadastro de encomenda, validações, identificador, visualização da etiqueta, impressão e armazenamento local offline.

**Critério de aceite:** um operador consegue registrar e imprimir uma encomenda sem internet, fechar e abrir a aplicação e recuperar os dados.

### Fase 2 — fundação de produção

**Entregáveis:** usuários, permissões, SQLite com migrações, API ASP.NET Core, banco central, backups, auditoria e sincronização básica.

**Critério de aceite:** uma operação feita offline chega ao servidor após o retorno da conexão sem duplicação; falhas ficam visíveis e podem ser repetidas.

### Fase 3 — encomendas completas

**Entregáveis:** estados de transporte, rotas, busca, histórico, reimpressão, relatórios e tratamento de conflitos.

**Critério de aceite:** o fluxo real do barco pode ser executado do recebimento à entrega, inclusive com sinal intermitente.

### Fase 4 — mercadinho

**Entregáveis:** produtos, preços, movimentos, vendas, inventário, perdas e relatórios definidos na descoberta.

**Critério de aceite:** o saldo pode ser explicado por movimentos auditáveis e permanece correto após sincronização.

### Fase 5 — suítes

**Entregáveis:** cadastro, calendário, disponibilidade, reserva, check-in/check-out e conflitos.

**Critério de aceite:** o sistema não confirma duas reservas para a mesma suíte no mesmo período sem gerar uma ocorrência explícita.

### Fase 6 — piloto e endurecimento

**Entregáveis:** instalação no ambiente real, treinamento, manual curto, plano de suporte, monitoramento, testes de restauração e procedimento de contingência em papel.

**Critério de aceite:** o operador consegue continuar o trabalho durante uma indisponibilidade e recuperar a operação sem perda de dados.

## 11. Perguntas para a primeira entrevista com o cliente

### Operação do barco

1. Qual é o nome da operação e quais barcos ou unidades usarão o sistema?
2. Onde as encomendas são recebidas e onde são entregues?
3. Quais são as rotas, cidades, portos e pontos de atendimento?
4. Em que momentos há internet, Wi-Fi local ou nenhum tipo de rede?
5. Quantas pessoas trabalham em cada frente e em quais turnos?

### Encomendas

6. Quais campos são obrigatórios no caderno e na etiqueta?
7. Há um padrão atual de numeração, preço, comprovante ou recibo?
8. Quais estados uma encomenda pode ter?
9. Há encomendas frágeis, perecíveis, restritas ou que exigem tratamento especial?
10. A entrega é confirmada por assinatura, foto, código ou apenas por atualização manual?

### Mercadinho

11. É apenas estoque ou também venda/caixa?
12. Quantos produtos existem e com que frequência mudam os preços?
13. O estoque é único ou separado por local/câmara/prateleira?
14. Existem lotes, validade, perdas, consignação ou inventário periódico?
15. Há obrigação fiscal ou integração com algum sistema já existente?

### Suítes

16. Quantas suítes existem e quais categorias/capacidades elas têm?
17. Quem pode criar, alterar e cancelar reservas?
18. A disponibilidade precisa funcionar e ser confirmada offline?
19. Como são controlados check-in, check-out, limpeza e manutenção?
20. Há pagamento, caução, nota, documento do hóspede ou integração externa?

### Tecnologia e implantação

21. Quais dispositivos já existem: notebook, computador, tablet, celular, leitor ou impressora?
22. Qual é a marca/modelo e a conexão da impressora?
23. Mais de um dispositivo precisará alterar os mesmos registros ao mesmo tempo?
24. Há uma rede Wi-Fi interna no barco mesmo sem internet?
25. Quem fará o suporte e a troca de equipamento em caso de falha?
26. O cliente precisa acessar relatórios de terra, fora do barco?
27. Qual é o orçamento para hospedagem, domínio, impressoras, servidor local e manutenção?

## 12. Decisões pendentes

- Plataforma principal: Windows, Android, ambas ou navegador.
- Quantidade de dispositivos e usuários simultâneos.
- Necessidade de servidor local dentro do barco.
- Impressora e formato da etiqueta.
- Política de conflitos de reservas e estoque.
- Necessidade de acesso remoto em terra.
- Banco central: PostgreSQL ou SQL Server.
- Forma de autenticação offline.
- Requisitos fiscais e legais.
- Política de backup, retenção e suporte.

## 13. Próximo passo recomendado

Quando o cliente enviar a descrição, não devemos começar diretamente pelo banco ou pelas telas. O próximo passo será converter a descrição em:

1. mapa dos atores e dos processos;
2. requisitos funcionais e não funcionais;
3. regras de negócio testáveis;
4. matriz de dados obrigatórios por operação;
5. cenários online, offline, sincronização e conflito;
6. backlog priorizado para o MVP;
7. decisão registrada de plataforma e implantação;
8. protótipo do fluxo de encomenda e etiqueta.

Depois dessa validação, o projeto poderá ser criado em uma solução C# modular, com testes de domínio e de sincronização desde o início. A arquitetura deve crescer a partir dos fluxos reais do barco, sem transformar hipóteses em funcionalidades caras antes de serem confirmadas.

## Fontes técnicas consultadas

- [Política oficial de suporte do .NET](https://dotnet.microsoft.com/en-us/platform/support/policy)
- [ASP.NET Core Blazor PWA e suporte offline](https://learn.microsoft.com/en-us/aspnet/core/blazor/progressive-web-app/?view=aspnetcore-10.0)
- [Modelos de hospedagem do Blazor no ASP.NET Core 10](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models?view=aspnetcore-10.0)
- [Banco SQLite local no .NET MAUI](https://learn.microsoft.com/en-us/dotnet/maui/data-cloud/database-sqlite?view=net-maui-10.0)
- [Provedor SQLite do EF Core](https://learn.microsoft.com/en-us/ef/core/providers/sqlite/)
- [Windows App SDK](https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/)
- [Plataformas suportadas pelo .NET MAUI](https://learn.microsoft.com/en-us/dotnet/maui/supported-platforms?view=net-maui-10.0)
