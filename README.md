# Barco José — MVP de validação

Protótipo funcional navegável para validar com o cliente os fluxos de encomendas, estoque do mercadinho e reservas de suítes.

## Link de demonstração

[Abrir MVP do Barco José](https://barco-jose-mvp.vercel.app)

O ambiente usa dados fictícios, não possui login e salva alterações somente no armazenamento local do navegador. Ele não é ainda o sistema operacional definitivo nem possui backend, sincronização real ou integração física com impressora.

## O que testar com o cliente

### Encomendas

- localizar encomendas por código, pessoa ou cidade;
- filtrar por status e cidade;
- abrir os detalhes de uma encomenda;
- avançar o status;
- preparar/reimprimir uma etiqueta;
- cadastrar uma nova encomenda.

### Estoque

- consultar produtos e saldo;
- identificar produtos abaixo do mínimo;
- filtrar por categoria;
- registrar entrada ou saída.

### Suítes

- conferir suítes livres, ocupadas, reservadas e em limpeza;
- filtrar por tipo de cama;
- cadastrar uma reserva para uma suíte livre;
- visualizar as próximas reservas.

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

Também foram testados no navegador local o cadastro de encomenda, o detalhe/etiqueta, o movimento de estoque, a criação de reserva e a navegação entre os três módulos. O deploy público foi validado com HTTP 200 e sem erros de console.

## Próxima etapa

Usar o link com o cliente e registrar, para cada tela:

1. campos que estão faltando;
2. nomes que precisam ser alterados;
3. ordem real das operações;
4. filtros mais importantes;
5. regras de exceção;
6. formato e impressora da etiqueta;
7. dispositivos e períodos sem internet.

As decisões de backend C#, banco central, sincronização offline e aplicação nativa/híbrida devem ser tomadas depois dessa validação do fluxo.
