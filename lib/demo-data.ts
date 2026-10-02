export type ModuleKey = "overview" | "orders" | "stock" | "suites";

export type OrderStatus = "Aguardando embarque" | "Em trânsito" | "Entregue" | "Devolvida";
export type OrderCategory = "Documentos" | "Caixa" | "Frágil" | "Perecível";

export type Order = {
  id: string;
  code: string;
  recipient: string;
  sender: string;
  city: string;
  destination: string;
  category: OrderCategory;
  status: OrderStatus;
  receivedAt: string;
  contact: string;
  notes: string;
  printed: boolean;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minimum: number;
  updatedAt: string;
  location: string;
};

export type SuiteStatus = "Livre" | "Ocupada" | "Reservada" | "Limpeza";
export type SuiteCategory = "Cama de solteiro" | "Cama de casal";

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
  guests: number;
  checkIn: string;
  checkOut: string;
  status: "Confirmada" | "Pendente";
};

export const initialOrders: Order[] = [
  {
    id: "ord-001",
    code: "EN-24091",
    recipient: "Maria de Lourdes Silva",
    sender: "José Andrade",
    city: "Manacapuru",
    destination: "Porto de Manacapuru",
    category: "Caixa",
    status: "Aguardando embarque",
    receivedAt: "02 out · 09:42",
    contact: "(92) 99124-4801",
    notes: "Frágil — manter na parte superior da carga.",
    printed: true,
  },
  {
    id: "ord-002",
    code: "EN-24090",
    recipient: "Mercadinho São Pedro",
    sender: "Distribuidora Norte",
    city: "Novo Airão",
    destination: "Porto de Novo Airão",
    category: "Perecível",
    status: "Aguardando embarque",
    receivedAt: "02 out · 09:18",
    contact: "(92) 98214-7730",
    notes: "Conferir quantidade no desembarque.",
    printed: true,
  },
  {
    id: "ord-003",
    code: "EN-24089",
    recipient: "Raimundo Nonato Costa",
    sender: "Ana Paula Costa",
    city: "Tefé",
    destination: "Porto de Tefé",
    category: "Documentos",
    status: "Em trânsito",
    receivedAt: "01 out · 16:06",
    contact: "(97) 99101-2034",
    notes: "Entregar somente ao destinatário.",
    printed: true,
  },
  {
    id: "ord-004",
    code: "EN-24088",
    recipient: "Clínica Vida Ribeirinha",
    sender: "Laboratório Central",
    city: "Parintins",
    destination: "Porto de Parintins",
    category: "Frágil",
    status: "Entregue",
    receivedAt: "30 set · 11:27",
    contact: "(92) 99345-1880",
    notes: "Manter em local seco.",
    printed: true,
  },
  {
    id: "ord-005",
    code: "EN-24087",
    recipient: "Dona Francisca Oliveira",
    sender: "João Oliveira",
    city: "Coari",
    destination: "Porto de Coari",
    category: "Caixa",
    status: "Devolvida",
    receivedAt: "29 set · 14:52",
    contact: "(97) 99200-7712",
    notes: "Destinatário ausente na tentativa de entrega.",
    printed: true,
  },
];

export const initialProducts: Product[] = [
  { id: "prod-001", name: "Água mineral 500 ml", category: "Bebidas", unit: "fardo", stock: 18, minimum: 10, updatedAt: "Hoje, 08:30", location: "Prateleira A1" },
  { id: "prod-002", name: "Refrigerante lata", category: "Bebidas", unit: "unidade", stock: 42, minimum: 24, updatedAt: "Ontem, 17:10", location: "Prateleira A2" },
  { id: "prod-003", name: "Biscoito salgado", category: "Alimentos", unit: "pacote", stock: 9, minimum: 12, updatedAt: "Hoje, 07:45", location: "Prateleira B1" },
  { id: "prod-004", name: "Café torrado 250 g", category: "Alimentos", unit: "pacote", stock: 16, minimum: 8, updatedAt: "30 set, 12:15", location: "Prateleira B2" },
  { id: "prod-005", name: "Repelente", category: "Higiene", unit: "unidade", stock: 6, minimum: 8, updatedAt: "29 set, 16:40", location: "Prateleira C1" },
  { id: "prod-006", name: "Carregador USB", category: "Utilidades", unit: "unidade", stock: 11, minimum: 5, updatedAt: "28 set, 10:05", location: "Balcão" },
];

export const initialSuites: Suite[] = [
  { id: "suite-101", number: "101", category: "Cama de casal", beds: "1 cama de casal", capacity: 2, status: "Ocupada", guest: "Carlos e Elaine Souza", checkout: "04 out" },
  { id: "suite-102", number: "102", category: "Cama de solteiro", beds: "2 camas de solteiro", capacity: 2, status: "Livre" },
  { id: "suite-103", number: "103", category: "Cama de casal", beds: "1 cama de casal", capacity: 2, status: "Reservada", guest: "Paulo Mendes", checkout: "06 out" },
  { id: "suite-104", number: "104", category: "Cama de solteiro", beds: "3 camas de solteiro", capacity: 3, status: "Limpeza" },
  { id: "suite-105", number: "105", category: "Cama de casal", beds: "1 cama de casal", capacity: 2, status: "Livre" },
  { id: "suite-106", number: "106", category: "Cama de solteiro", beds: "2 camas de solteiro", capacity: 2, status: "Livre" },
];

export const initialBookings: Booking[] = [
  { id: "book-001", suiteId: "suite-103", guest: "Paulo Mendes", guests: 1, checkIn: "06 out", checkOut: "09 out", status: "Confirmada" },
];
