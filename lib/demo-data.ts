export type ModuleKey = "overview" | "orders" | "stock" | "suites" | "reports";

export type ReportPeriod = "Semana" | "Mês";

export type OrderStatus = "Aguardando embarque" | "Guardada" | "Embarcada" | "Em trânsito" | "Entregue" | "Devolvida";
export type OrderCategory = "Documentos" | "Caixa" | "Frágil" | "Perecível";
export type OrderPaymentStatus = "Pago" | "Pendente" | "Pago no destino" | "Dispensado";
export type StorageLocation = "Sala de Encomendas 1" | "Sala de Encomendas 2" | "Escritório" | "Porão X" | "Freezer" | "Frigorífico";

export type Order = {
  id: string;
  code: string;
  recipient: string;
  recipientDocument: string;
  sender: string;
  senderDocument: string;
  originCity: string;
  city: string;
  destination: string;
  category: OrderCategory;
  status: OrderStatus;
  receivedAt: string;
  contact: string;
  notes: string;
  printed: boolean;
  amount: number;
  discount: number;
  discountNote: string;
  paymentStatus: OrderPaymentStatus;
  storageLocation: StorageLocation;
  storageUpdatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  minimum: number;
  updatedAt: string;
  location: string;
};

export type SalePaymentMethod = "PIX" | "Cartão" | "Dinheiro" | "Pendente";

export type SaleItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Sale = {
  id: string;
  code: string;
  items: SaleItem[];
  total: number;
  paymentMethod: SalePaymentMethod;
  soldAt: string;
  period: ReportPeriod;
};

export type FinancialEntryType = "Receita" | "Despesa";

export type FinancialEntry = {
  id: string;
  type: FinancialEntryType;
  description: string;
  amount: number;
  category: string;
  source: "Venda" | "Lançamento manual";
  date: string;
  period: ReportPeriod;
};

export type SuiteStatus = "Livre" | "Ocupada" | "Reservada" | "Limpeza";
export type SuiteCategory = "Padrão";
export type BookingPaymentStatus = "Pago (simulado)" | "Pendente" | "Pago no local";

export type Suite = {
  id: string;
  number: string;
  category: SuiteCategory;
  beds: string;
  capacity: number;
  status: SuiteStatus;
  guest?: string;
  checkout?: string;
};

export type Booking = {
  id: string;
  suiteId: string;
  guest: string;
  guestDocument: string;
  guestContact: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  notes: string;
  paymentStatus: BookingPaymentStatus;
  status: "Confirmada" | "Pendente" | "Cancelada";
};

export const initialOrders: Order[] = [
  { id: "ord-001", code: "EN-24091", recipient: "Maria de Lourdes Silva", recipientDocument: "CPF 123.456.789-09", sender: "José Andrade", senderDocument: "RG 31.456.789-0", originCity: "Manaus", city: "Manacapuru", destination: "Porto de Manacapuru", category: "Caixa", status: "Guardada", receivedAt: "02 out · 09:42", contact: "(92) 99124-4801", notes: "Frágil — manter na parte superior da carga.", printed: true, amount: 85, discount: 5, discountNote: "Cliente recorrente", paymentStatus: "Pago no destino", storageLocation: "Sala de Encomendas 1", storageUpdatedAt: "Hoje, 09:45" },
  { id: "ord-002", code: "EN-24090", recipient: "Mercadinho São Pedro", recipientDocument: "CNPJ 04.123.567/0001-10", sender: "Distribuidora Norte", senderDocument: "CNPJ 08.765.432/0001-20", originCity: "Manaus", city: "Novo Airão", destination: "Porto de Novo Airão", category: "Perecível", status: "Aguardando embarque", receivedAt: "02 out · 09:18", contact: "(92) 98214-7730", notes: "Conferir quantidade no desembarque.", printed: true, amount: 240, discount: 0, discountNote: "", paymentStatus: "Pago", storageLocation: "Freezer", storageUpdatedAt: "Hoje, 09:22" },
  { id: "ord-003", code: "EN-24089", recipient: "Raimundo Nonato Costa", recipientDocument: "RG 22.345.678-1", sender: "Ana Paula Costa", senderDocument: "CPF 987.654.321-00", originCity: "Tefé", city: "Tefé", destination: "Porto de Tefé", category: "Documentos", status: "Em trânsito", receivedAt: "01 out · 16:06", contact: "(97) 99101-2034", notes: "Entregar somente ao destinatário.", printed: true, amount: 35, discount: 0, discountNote: "", paymentStatus: "Pago", storageLocation: "Escritório", storageUpdatedAt: "01 out, 16:10" },
  { id: "ord-004", code: "EN-24088", recipient: "Clínica Vida Ribeirinha", recipientDocument: "CNPJ 11.222.333/0001-44", sender: "Laboratório Central", senderDocument: "CNPJ 55.666.777/0001-88", originCity: "Manaus", city: "Parintins", destination: "Porto de Parintins", category: "Frágil", status: "Entregue", receivedAt: "30 set · 11:27", contact: "(92) 99345-1880", notes: "Manter em local seco.", printed: true, amount: 120, discount: 20, discountNote: "Condição comercial", paymentStatus: "Pago", storageLocation: "Sala de Encomendas 2", storageUpdatedAt: "30 set, 11:30" },
  { id: "ord-005", code: "EN-24087", recipient: "Dona Francisca Oliveira", recipientDocument: "CPF 111.222.333-44", sender: "João Oliveira", senderDocument: "RG 44.555.666-7", originCity: "Manaus", city: "Coari", destination: "Porto de Coari", category: "Caixa", status: "Devolvida", receivedAt: "29 set · 14:52", contact: "(97) 99200-7712", notes: "Destinatário ausente na tentativa de entrega.", printed: true, amount: 60, discount: 0, discountNote: "", paymentStatus: "Pendente", storageLocation: "Sala de Encomendas 1", storageUpdatedAt: "30 set, 08:00" },
];

export const initialProducts: Product[] = [
  { id: "prod-001", name: "Água mineral 500 ml", category: "Bebidas", unit: "fardo", price: 28, stock: 18, minimum: 10, updatedAt: "Hoje, 08:30", location: "Prateleira A1" },
  { id: "prod-002", name: "Refrigerante lata", category: "Bebidas", unit: "unidade", price: 6, stock: 42, minimum: 24, updatedAt: "Ontem, 17:10", location: "Prateleira A2" },
  { id: "prod-003", name: "Biscoito salgado", category: "Alimentos", unit: "pacote", price: 5, stock: 9, minimum: 12, updatedAt: "Hoje, 07:45", location: "Prateleira B1" },
  { id: "prod-004", name: "Café torrado 250 g", category: "Alimentos", unit: "pacote", price: 18, stock: 16, minimum: 8, updatedAt: "30 set, 12:15", location: "Prateleira B2" },
  { id: "prod-005", name: "Repelente", category: "Higiene", unit: "unidade", price: 22, stock: 6, minimum: 8, updatedAt: "29 set, 16:40", location: "Prateleira C1" },
  { id: "prod-006", name: "Carregador USB", category: "Utilidades", unit: "unidade", price: 35, stock: 11, minimum: 5, updatedAt: "28 set, 10:05", location: "Balcão" },
];

export const initialSales: Sale[] = [
  { id: "sale-001", code: "VD-0182", items: [{ productId: "prod-002", productName: "Refrigerante lata", quantity: 3, unitPrice: 6, total: 18 }], total: 18, paymentMethod: "PIX", soldAt: "Hoje, 10:15", period: "Semana" },
  { id: "sale-002", code: "VD-0181", items: [{ productId: "prod-004", productName: "Café torrado 250 g", quantity: 2, unitPrice: 18, total: 36 }], total: 36, paymentMethod: "Dinheiro", soldAt: "Hoje, 09:40", period: "Semana" },
  { id: "sale-003", code: "VD-0180", items: [{ productId: "prod-006", productName: "Carregador USB", quantity: 1, unitPrice: 35, total: 35 }], total: 35, paymentMethod: "Cartão", soldAt: "01 out · 16:20", period: "Mês" },
];

export const initialFinancialEntries: FinancialEntry[] = [
  { id: "fin-001", type: "Receita", description: "Venda VD-0182", amount: 18, category: "Venda", source: "Venda", date: "Hoje, 10:15", period: "Semana" },
  { id: "fin-002", type: "Receita", description: "Venda VD-0181", amount: 36, category: "Venda", source: "Venda", date: "Hoje, 09:40", period: "Semana" },
  { id: "fin-003", type: "Receita", description: "Venda VD-0180", amount: 35, category: "Venda", source: "Venda", date: "01 out · 16:20", period: "Mês" },
  { id: "fin-004", type: "Despesa", description: "Compra de bebidas", amount: 120, category: "Reposição", source: "Lançamento manual", date: "01 out · 11:30", period: "Mês" },
  { id: "fin-005", type: "Despesa", description: "Material de limpeza", amount: 42, category: "Operacional", source: "Lançamento manual", date: "30 set · 14:10", period: "Mês" },
  { id: "fin-006", type: "Despesa", description: "Compra de bebidas", amount: 75, category: "Reposição", source: "Lançamento manual", date: "Hoje, 08:00", period: "Semana" },
];

export const initialSuites: Suite[] = [
  { id: "suite-101", number: "101", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Ocupada", guest: "Carlos e Elaine Souza", checkout: "04 out" },
  { id: "suite-102", number: "102", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Livre" },
  { id: "suite-103", number: "103", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Reservada", guest: "Paulo Mendes", checkout: "06 out" },
  { id: "suite-104", number: "104", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Limpeza" },
  { id: "suite-105", number: "105", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Livre" },
  { id: "suite-106", number: "106", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Livre" },
  { id: "suite-107", number: "107", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Livre" },
  { id: "suite-108", number: "108", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Ocupada", guest: "Rafael Lima", checkout: "05 out" },
  { id: "suite-109", number: "109", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Livre" },
  { id: "suite-110", number: "110", category: "Padrão", beds: "2 camas de solteiro", capacity: 2, status: "Livre" },
];

export const initialBookings: Booking[] = [
  { id: "book-001", suiteId: "suite-103", guest: "Paulo Mendes", guestDocument: "CPF 222.333.444-55", guestContact: "(92) 98888-1010", guests: 1, checkIn: "06 out", checkOut: "09 out", notes: "Chegará após o jantar.", paymentStatus: "Pago (simulado)", status: "Confirmada" },
];
