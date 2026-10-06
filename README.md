# Barco José — MVP de validação

Protótipo funcional navegável para validar com o cliente os fluxos de encomendas, lanchonete, reservas de suítes e relatórios da operação.

## Link de demonstração

[Abrir MVP do Barco José](https://barco-jose-mvp.vercel.app)

O ambiente usa dados fictícios, não possui login e salva alterações no armazenamento local do navegador. Há uma fila de alterações e um modo offline apenas demonstrativos; a conciliação não envia dados para um servidor. Ele não é ainda o sistema operacional definitivo e não possui backend C#, pagamento online real ou integração física com impressora.

## O que testar com o cliente

### Encomendas

- localizar encomendas por código, pessoa ou cidade;
- filtrar por status, cidade, local físico e pagamento;
- abrir os detalhes, documentos, cobrança e histórico de custódia;
- avançar o status sem perder a trilha da encomenda;
- preparar/reimprimir uma etiqueta;
- cadastrar uma nova encomenda.

### Lanchonete

- consultar produtos, preços e saldo;
- identificar produtos abaixo do mínimo;
- filtrar por categoria;
- registrar entrada ou saída;
- registrar venda na hora;
- lançar despesa;
- consultar receitas, despesas e histórico de movimentos.

### Suítes

- conferir as 10 suítes livres, ocupadas, reservadas e em limpeza;
- cadastrar uma reserva com hóspede, CPF, contato e observações;
- visualizar o status de pagamento simulado;
- visualizar as próximas reservas.

### Relatórios

- alternar entre semana e mês;
- revisar receitas, despesas e vendas;
- acompanhar encomendas com pagamento pendente ou no destino;
- acompanhar ocupação das suítes e alertas operacionais.

## Como executar localmente

```powershell
npm.cmd install
npm.cmd run dev
```

Depois, acesse `http://localhost:3000`.

## Verificações executadas

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Também foram testados no navegador local o modo offline demonstrativo, numeração sequencial de encomendas, limite de desconto, histórico de custódia, avanço de status, histórico de estoque, venda sequencial, persistência após recarregar, bloqueio por capacidade da suíte, relatórios semanais/mensais e conciliação da fila local. O deploy público anterior não foi alterado nesta etapa.

## Próxima etapa

Usar o link com o cliente e registrar, para cada tela:

1. campos que estão faltando;
2. nomes que precisam ser alterados;
3. ordem real das operações;
4. filtros mais importantes;
5. regras de exceção;
6. formato e impressora da etiqueta;
7. dispositivos e períodos sem internet.

As decisões de backend C#, banco central, sincronização offline real, autenticação, pagamento e aplicação nativa/híbrida devem ser tomadas depois dessa validação do fluxo.
