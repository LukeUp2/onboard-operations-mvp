# Relatório de testes e furos — MVP local

**Data:** 5 de outubro de 2026  
**Ambiente:** http://localhost:3000  
**Escopo:** validação funcional local, sem deploy

## Verificações automatizadas

| Verificação | Resultado |
|---|---|
| npm.cmd run typecheck | aprovado |
| npm.cmd run lint | aprovado |
| npm.cmd run build | aprovado após a última rodada de endurecimento |
| git diff --check | aprovado |

## Cenários funcionais executados no navegador

| Cenário | Evidência observada | Resultado |
|---|---|---|
| Alternar modo offline demonstrativo | Indicador mudou para “Modo offline” | aprovado |
| Criar encomenda | Nova encomenda recebeu EN-24092 sem colisão com os dados iniciais | aprovado |
| Desconto maior que o valor | Valor final não ficou negativo; desconto foi limitado ao valor atribuído | aprovado |
| Detalhar encomenda | Documentos, cobrança, local e histórico de custódia apareceram | aprovado |
| Avançar encomenda | Status mudou para “Embarcada” e novo evento entrou no histórico | aprovado |
| Entrada de estoque | Saldo aumentou e apareceu como “Entrada” no histórico | aprovado |
| Saída acima do estoque | Operação foi bloqueada e o diálogo permaneceu aberto | aprovado |
| Venda na lanchonete | Venda VD-183 baixou o saldo, criou receita e movimento de “Venda” | aprovado |
| Persistência | Encomenda, venda, saldo e movimentos permaneceram após recarregar | aprovado |
| Capacidade da suíte | Três hóspedes em suíte de capacidade dois exibiram erro e desabilitaram confirmação | aprovado |
| Relatório semanal | Receita passou a refletir a venda criada (R$ 82,00 no cenário testado) | aprovado |
| Fila local | Alterações foram contabilizadas e conciliadas apenas na demonstração | aprovado |

## Furos conhecidos e decisão

### Bloqueadores para produção

- Pagamento online ainda é simulado; não há provedor nem confirmação por webhook.
- Não há API C#, banco central, autenticação, autorização ou sincronização real.
- A fila local não transmite operações, não é idempotente contra um servidor e não resolve conflitos.
- Dados pessoais ficam no armazenamento do navegador; usar somente dados fictícios até definir LGPD, acesso, retenção e criptografia.
- Impressão usa window.print; não foi validada impressora térmica, etiqueta, QR Code, código de barras ou reimpressão física.
- Datas de reserva são textos simplificados, sem verificação de sobreposição por datas/horários.
- Locais de encomenda ainda são opções fixas; o cliente deverá confirmar se serão cadastráveis.
- Não há backup, restauração, exportação, fechamento fiscal ou trilha de auditoria persistente.

### Melhorias já aplicadas no protótipo

- Numeração de encomendas e vendas deixou de ser aleatória.
- Desconto não pode gerar valor final negativo.
- Venda não pode exceder o estoque disponível.
- Reserva não pode exceder a capacidade da suíte.
- Estado local inválido é descartado em favor dos dados de demonstração.
- Falhas de localStorage não interrompem a interface.
- “Pago no destino” e “Pendente” não aparecem como pagamentos concluídos.
- Histórico de custódia e movimentos de estoque agora são visíveis.

## Próximos testes antes da fundação C#

1. Repetir o fluxo com dois dispositivos e conexão intermitente.
2. Definir política de conflito para estoque, encomendas e reservas.
3. Testar desligamento abrupto, armazenamento cheio e restauração de backup.
4. Validar impressora e formato real da etiqueta.
5. Confirmar datas, cancelamento, estorno e pagamento online das suítes.
6. Converter as regras confirmadas em testes de domínio no backend ASP.NET Core.

