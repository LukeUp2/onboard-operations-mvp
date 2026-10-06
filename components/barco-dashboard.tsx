"use client";

import {
  AlertTriangle,
  Anchor,
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  BedDouble,
  BadgeCheck,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  CloudOff,
  CloudUpload,
  CreditCard,
  DoorOpen,
  FileBarChart,
  FileText,
  Filter,
  LayoutDashboard,
  MapPin,
  MapPinned,
  Menu,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Warehouse,
  WalletCards,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Booking,
  BookingPaymentStatus,
  FinancialEntry,
  initialBookings,
  initialFinancialEntries,
  initialOrders,
  initialProducts,
  initialSales,
  initialSuites,
  ModuleKey,
  Order,
  OrderCategory,
  OrderPaymentStatus,
  OrderStatus,
  Product,
  ReportPeriod,
  Sale,
  SalePaymentMethod,
  Suite,
  StorageLocation,
} from "@/lib/demo-data";

const STORAGE_KEY = "barco-jose-mvp-state-v2";

const moduleMeta: Record<ModuleKey, { label: string; eyebrow: string; title: string; description: string }> = {
  overview: {
    label: "Visão geral",
    eyebrow: "Operação embarcada",
    title: "Bom dia, equipe",
    description: "Acompanhe o movimento do barco e resolva as tarefas mais importantes de hoje.",
  },
  orders: {
    label: "Encomendas",
    eyebrow: "Recebimento e entrega",
    title: "Encomendas",
    description: "Encontre rapidamente cargas por cidade, status e tipo antes do embarque.",
  },
  stock: {
    label: "Lanchonete",
    eyebrow: "Vendas e estoque",
    title: "Lanchonete de bordo",
    description: "Registre vendas, movimentos de estoque, receitas e despesas da operação.",
  },
  suites: {
    label: "Suítes",
    eyebrow: "Hospedagem a bordo",
    title: "Disponibilidade de suítes",
    description: "Consulte as 10 suítes, registre hóspedes e acompanhe os pagamentos das reservas.",
  },
  reports: {
    label: "Relatórios",
    eyebrow: "Visão gerencial",
    title: "Relatórios da operação",
    description: "Acompanhe receitas, despesas, encomendas, vendas e ocupação por período.",
  },
};

const orderStatuses: Array<OrderStatus | "Todas"> = ["Todas", "Aguardando embarque", "Guardada", "Embarcada", "Em trânsito", "Entregue", "Devolvida"];
const orderPaymentStatuses: Array<OrderPaymentStatus | "Todos"> = ["Todos", "Pago", "Pendente", "Pago no destino", "Dispensado"];
const storageLocations: StorageLocation[] = ["Sala de Encomendas 1", "Sala de Encomendas 2", "Escritório", "Porão X", "Freezer", "Frigorífico"];
const bookingPaymentStatuses: BookingPaymentStatus[] = ["Pago (simulado)", "Pendente", "Pago no local"];

function statusClass(status: OrderStatus | Suite["status"] | OrderPaymentStatus | BookingPaymentStatus) {
  const normalized = status.toLowerCase();
  if (normalized.includes("entregue") || normalized.includes("livre") || normalized.includes("pago") || normalized.includes("confirmada")) return "status-positive";
  if (normalized.includes("trânsito") || normalized.includes("reservada") || normalized.includes("ocupada") || normalized.includes("embarcada")) return "status-info";
  if (normalized.includes("devolvida") || normalized.includes("limpeza")) return "status-warning";
  return "status-neutral";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function nextOrderStatus(status: OrderStatus): OrderStatus {
  if (status === "Aguardando embarque" || status === "Guardada") return "Embarcada";
  if (status === "Embarcada") return "Em trânsito";
  if (status === "Em trânsito") return "Entregue";
  return status;
}

export function BarcoDashboard() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("overview");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(initialFinancialEntries);
  const [suites, setSuites] = useState<Suite[]>(initialSuites);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOfflineDemo, setIsOfflineDemo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState("Agora");
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { orders?: Order[]; products?: Product[]; sales?: Sale[]; financialEntries?: FinancialEntry[]; suites?: Suite[]; bookings?: Booking[] };
          if (parsed.orders) setOrders(parsed.orders);
          if (parsed.products) setProducts(parsed.products);
          if (parsed.sales) setSales(parsed.sales);
          if (parsed.financialEntries) setFinancialEntries(parsed.financialEntries);
          if (parsed.suites) setSuites(parsed.suites);
          if (parsed.bookings) setBookings(parsed.bookings);
        }
      } catch {
        // The MVP remains usable with the seed data if browser storage is unavailable.
      } finally {
        setIsHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ orders, products, sales, financialEntries, suites, bookings }));
  }, [bookings, financialEntries, isHydrated, orders, products, sales, suites]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const metrics = useMemo(() => ({
    ordersPending: orders.filter((order) => order.status === "Aguardando embarque").length,
    ordersTransit: orders.filter((order) => order.status === "Em trânsito").length,
    productsLow: products.filter((product) => product.stock <= product.minimum).length,
    suitesFree: suites.filter((suite) => suite.status === "Livre").length,
    suitesOccupied: suites.filter((suite) => suite.status === "Ocupada").length,
    salesToday: sales.filter((sale) => sale.soldAt.toLowerCase().includes("hoje")).reduce((total, sale) => total + sale.total, 0),
    monthRevenue: financialEntries.filter((entry) => entry.type === "Receita").reduce((total, entry) => total + entry.amount, 0),
    monthExpenses: financialEntries.filter((entry) => entry.type === "Despesa").reduce((total, entry) => total + entry.amount, 0),
  }), [financialEntries, orders, products, sales, suites]);

  const currentMeta = moduleMeta[activeModule];

  function goTo(module: ModuleKey) {
    setActiveModule(module);
    setSidebarOpen(false);
  }

  function showToast(message: string) {
    setToast(message);
  }

  function markPending(message: string) {
    setLastSync("Pendente");
    showToast(message);
  }

  function syncDemo() {
    setLastSync("Agora");
    showToast("Demonstração sincronizada. Nenhum dado real foi enviado.");
  }

  function handleOrderCreated(order: Order) {
    setOrders((current) => [order, ...current]);
    setSelectedOrder(order);
    setActiveModule("orders");
    setOrderDialogOpen(false);
    markPending(`Encomenda ${order.code} salva localmente.`);
  }

  function handleOrderStatusChange() {
    if (!selectedOrder) return;
    const updated = { ...selectedOrder, status: nextOrderStatus(selectedOrder.status) };
    setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));
    setSelectedOrder(updated);
    markPending(`Status atualizado para “${updated.status}”.`);
  }

  function handlePrint(order: Order) {
    const updated = { ...order, printed: true };
    setOrders((current) => current.map((item) => item.id === order.id ? updated : item));
    setSelectedOrder(updated);
    showToast("Etiqueta preparada para impressão.");
    window.setTimeout(() => window.print(), 80);
  }

  function handleStockMovement(productId: string, type: "entry" | "exit", quantity: number) {
    setProducts((current) => current.map((product) => {
      if (product.id !== productId) return product;
      const nextStock = type === "entry" ? product.stock + quantity : Math.max(0, product.stock - quantity);
      return { ...product, stock: nextStock, updatedAt: "Agora" };
    }));
    setStockDialogOpen(false);
    markPending(type === "entry" ? "Entrada registrada localmente." : "Saída registrada localmente.");
  }

  function handleSaleCreated(sale: Sale) {
    setSales((current) => [sale, ...current]);
    setProducts((current) => current.map((product) => {
      const item = sale.items.find((saleItem) => saleItem.productId === product.id);
      return item ? { ...product, stock: Math.max(0, product.stock - item.quantity), updatedAt: "Agora" } : product;
    }));
    setFinancialEntries((current) => [{ id: `fin-${Date.now()}`, type: "Receita", description: `Venda ${sale.code}`, amount: sale.total, category: "Venda", source: "Venda", date: sale.soldAt, period: sale.period }, ...current]);
    setSaleDialogOpen(false);
    markPending(`Venda ${sale.code} registrada localmente.`);
  }

  function handleExpenseCreated(entry: FinancialEntry) {
    setFinancialEntries((current) => [entry, ...current]);
    setExpenseDialogOpen(false);
    markPending("Despesa lançada localmente.");
  }

  function handleBookingCreated(booking: Booking) {
    setBookings((current) => [booking, ...current]);
    setSuites((current) => current.map((suite) => suite.id === booking.suiteId ? {
      ...suite,
      status: "Reservada",
      guest: booking.guest,
      checkout: booking.checkOut,
    } : suite));
    setBookingDialogOpen(false);
    markPending(`Reserva de ${booking.guest} salva localmente.`);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Anchor size={20} strokeWidth={2.2} /></div>
          <div>
            <strong>Barco José</strong>
            <span>Operação embarcada</span>
          </div>
        </div>

        <div className="sidebar-label">Menu principal</div>
        <nav className="main-nav" aria-label="Navegação principal">
          <NavItem icon={<LayoutDashboard size={18} />} label="Visão geral" active={activeModule === "overview"} onClick={() => goTo("overview")} />
          <NavItem icon={<Package size={18} />} label="Encomendas" active={activeModule === "orders"} badge={metrics.ordersPending} onClick={() => goTo("orders")} />
          <NavItem icon={<ShoppingBasket size={18} />} label="Lanchonete" active={activeModule === "stock"} badge={metrics.productsLow} onClick={() => goTo("stock")} />
          <NavItem icon={<BedDouble size={18} />} label="Suítes" active={activeModule === "suites"} onClick={() => goTo("suites")} />
          <NavItem icon={<FileBarChart size={18} />} label="Relatórios" active={activeModule === "reports"} onClick={() => goTo("reports")} />
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-demo-card">
          <div className="demo-card-icon"><Sparkles size={17} /></div>
          <div>
            <strong>Modo demonstração</strong>
            <span>Dados fictícios para validação</span>
          </div>
        </div>
        <button className="sidebar-link" type="button" onClick={() => showToast("Configurações estarão disponíveis na próxima etapa.")}>
          <Settings2 size={18} /> Configurações <ChevronDown size={15} className="sidebar-link-chevron" />
        </button>
        <div className="profile-mini">
          <div className="avatar avatar-small">JM</div>
          <div><strong>João Martins</strong><span>Operador</span></div>
          <button type="button" aria-label="Mais opções do usuário" onClick={() => showToast("Sessão de demonstração ativa.")}><SlidersHorizontal size={16} /></button>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" type="button" aria-label="Abrir menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumb"><span>Barco José</span><span className="breadcrumb-separator">/</span><strong>{currentMeta.label}</strong></div>
          <div className="topbar-actions">
            <button className={`network-pill ${isOfflineDemo ? "network-pill-offline" : ""}`} type="button" onClick={() => setIsOfflineDemo((value) => !value)}>
              {isOfflineDemo ? <CloudOff size={16} /> : <CloudUpload size={16} />}
              <span>{isOfflineDemo ? "Modo offline" : "Online"}</span>
              <span className="network-dot" />
            </button>
            <button className="icon-button notification-button" type="button" aria-label="Notificações" onClick={() => showToast("Você não tem novas notificações.")}><Bell size={19} /><span className="notification-dot" /></button>
            <div className="topbar-profile"><div className="avatar">JM</div><div><strong>João Martins</strong><span>Operador</span></div><ChevronDown size={16} /></div>
          </div>
        </header>

        <div className="page-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">{currentMeta.eyebrow}</div>
              <h1>{currentMeta.title}</h1>
              <p>{currentMeta.description}</p>
            </div>
            <div className="page-heading-actions">
              <div className="sync-status"><span className={`sync-dot ${lastSync === "Pendente" ? "sync-dot-pending" : ""}`} />{lastSync === "Pendente" ? "Alterações pendentes" : "Tudo sincronizado"}<span className="sync-time">· {lastSync}</span></div>
              {activeModule === "orders" && <button className="button button-primary" type="button" onClick={() => setOrderDialogOpen(true)}><Plus size={17} /> Nova encomenda</button>}
              {activeModule === "stock" && <div className="page-heading-button-group"><button className="button button-secondary" type="button" onClick={() => setExpenseDialogOpen(true)}><ReceiptText size={17} /> Nova despesa</button><button className="button button-primary" type="button" onClick={() => setSaleDialogOpen(true)}><Banknote size={17} /> Nova venda</button></div>}
              {activeModule === "suites" && <button className="button button-primary" type="button" onClick={() => setBookingDialogOpen(true)}><Plus size={17} /> Nova reserva</button>}
            </div>
          </div>

          {activeModule === "overview" && <Overview metrics={metrics} orders={orders} products={products} suites={suites} onNavigate={goTo} onSelectOrder={setSelectedOrder} />}
          {activeModule === "orders" && <OrdersModule orders={orders} selectedOrder={selectedOrder} onSelectOrder={setSelectedOrder} />}
          {activeModule === "stock" && <StockModule products={products} sales={sales} financialEntries={financialEntries} onMovement={() => setStockDialogOpen(true)} onSale={() => setSaleDialogOpen(true)} onExpense={() => setExpenseDialogOpen(true)} />}
          {activeModule === "suites" && <SuitesModule suites={suites} bookings={bookings} onBooking={() => setBookingDialogOpen(true)} />}
          {activeModule === "reports" && <ReportsModule orders={orders} products={products} sales={sales} financialEntries={financialEntries} suites={suites} bookings={bookings} />}
        </div>
      </main>

      <div className="floating-sync-area">
        <button className="floating-sync" type="button" onClick={syncDemo}><RefreshCw size={16} /> Sincronizar demonstração</button>
      </div>

      {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onPrint={() => handlePrint(selectedOrder)} onAdvanceStatus={handleOrderStatusChange} />}
      {orderDialogOpen && <OrderDialog onClose={() => setOrderDialogOpen(false)} onSubmit={handleOrderCreated} />}
      {stockDialogOpen && <StockDialog products={products} onClose={() => setStockDialogOpen(false)} onSubmit={handleStockMovement} />}
      {saleDialogOpen && <SaleDialog products={products} onClose={() => setSaleDialogOpen(false)} onSubmit={handleSaleCreated} />}
      {expenseDialogOpen && <ExpenseDialog onClose={() => setExpenseDialogOpen(false)} onSubmit={handleExpenseCreated} />}
      {bookingDialogOpen && <BookingDialog suites={suites} onClose={() => setBookingDialogOpen(false)} onSubmit={handleBookingCreated} />}
      {toast && <div className="toast" role="status"><CircleCheck size={17} /> {toast}</div>}
    </div>
  );
}

function NavItem({ icon, label, active, badge, onClick }: { icon: React.ReactNode; label: string; active: boolean; badge?: number; onClick: () => void }) {
  return <button className={`nav-item ${active ? "nav-item-active" : ""}`} type="button" onClick={onClick}>{icon}<span>{label}</span>{typeof badge === "number" && badge > 0 && <span className="nav-badge">{badge}</span>}</button>;
}

function Overview({ metrics, orders, products, suites, onNavigate, onSelectOrder }: { metrics: { ordersPending: number; ordersTransit: number; productsLow: number; suitesFree: number; suitesOccupied: number }; orders: Order[]; products: Product[]; suites: Suite[]; onNavigate: (module: ModuleKey) => void; onSelectOrder: (order: Order) => void }) {
  const recentOrders = orders.slice(0, 4);
  return <div className="module-stack">
    <section className="hero-banner">
      <div className="hero-copy"><span className="hero-kicker"><Sparkles size={15} /> Resumo da operação</span><h2>Clareza para cada etapa da viagem.</h2><p>Tenha uma visão rápida das encomendas, da lanchonete e das suítes em um só lugar.</p><button className="button button-light" type="button" onClick={() => onNavigate("orders")}>Ver encomendas <ArrowUpRight size={16} /></button></div>
      <div className="hero-illustration"><div className="hero-sun" /><div className="hero-wave wave-one" /><div className="hero-wave wave-two" /><div className="hero-boat"><div className="boat-cabin" /><div className="boat-hull" /></div></div>
    </section>

    <section className="metric-grid" aria-label="Indicadores da operação">
      <MetricCard icon={<PackageCheck size={20} />} label="Aguardando embarque" value={metrics.ordersPending} detail="encomendas prontas" tone="gold" onClick={() => onNavigate("orders")} />
      <MetricCard icon={<ArrowUpRight size={20} />} label="Em trânsito" value={metrics.ordersTransit} detail="em rota agora" tone="blue" onClick={() => onNavigate("orders")} />
      <MetricCard icon={<ShoppingBasket size={20} />} label="Estoque em atenção" value={metrics.productsLow} detail="produtos abaixo do mínimo" tone="orange" onClick={() => onNavigate("stock")} />
      <MetricCard icon={<BedDouble size={20} />} label="Suítes livres" value={metrics.suitesFree} detail={`${metrics.suitesOccupied} ocupada${metrics.suitesOccupied === 1 ? "" : "s"}`} tone="green" onClick={() => onNavigate("suites")} />
    </section>

    <div className="overview-grid">
      <section className="panel panel-orders-overview"><PanelHeader title="Encomendas recentes" description="Últimas movimentações registradas" actionLabel="Ver todas" onAction={() => onNavigate("orders")} /><div className="compact-list">{recentOrders.map((order) => <button key={order.id} type="button" className="compact-row" onClick={() => onSelectOrder(order)}><div className="compact-icon"><Package size={17} /></div><div className="compact-main"><strong>{order.code}</strong><span>{order.recipient}</span></div><div className="compact-destination"><MapPin size={14} />{order.city}</div><StatusPill status={order.status} /></button>)}</div></section>
      <section className="panel attention-panel"><PanelHeader title="Pontos de atenção" description="Itens que merecem uma conferência" /><div className="attention-list"><AttentionItem icon={<AlertTriangle size={18} />} title={`${metrics.productsLow} produto${metrics.productsLow === 1 ? "" : "s"} abaixo do mínimo`} detail="Revise o estoque da lanchonete" action="Ver lanchonete" onClick={() => onNavigate("stock")} /><AttentionItem icon={<Clock3 size={18} />} title={`${metrics.ordersPending} encomendas aguardando`} detail="Prontas para organizar no embarque" action="Organizar" onClick={() => onNavigate("orders")} /><AttentionItem icon={<CalendarDays size={18} />} title="Próxima saída amanhã" detail="Confira reservas e suítes" action="Ver suítes" onClick={() => onNavigate("suites")} /></div></section>
    </div>

    <section className="quick-actions"><div><div className="eyebrow">Ações rápidas</div><h3>Comece por uma tarefa</h3></div><div className="quick-action-grid"><QuickAction icon={<Package size={20} />} title="Nova encomenda" detail="Receber e etiquetar" onClick={() => onNavigate("orders")} /><QuickAction icon={<Boxes size={20} />} title="Conferir estoque" detail={`${products.length} produtos cadastrados`} onClick={() => onNavigate("stock")} /><QuickAction icon={<DoorOpen size={20} />} title="Ver disponibilidade" detail={`${suites.length} suítes no barco`} onClick={() => onNavigate("suites")} /></div></section>
  </div>;
}

function MetricCard({ icon, label, value, detail, tone, onClick }: { icon: React.ReactNode; label: string; value: number; detail: string; tone: string; onClick: () => void }) {
  return <button className="metric-card" type="button" onClick={onClick}><div className={`metric-icon metric-icon-${tone}`}>{icon}</div><div className="metric-content"><span>{label}</span><strong>{formatNumber(value)}</strong><small>{detail}</small></div><ArrowUpRight className="metric-arrow" size={17} /></button>;
}

function PanelHeader({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return <div className="panel-header"><div><h3>{title}</h3><p>{description}</p></div>{actionLabel && onAction && <button className="text-button" type="button" onClick={onAction}>{actionLabel}<ArrowUpRight size={15} /></button>}</div>;
}

function AttentionItem({ icon, title, detail, action, onClick }: { icon: React.ReactNode; title: string; detail: string; action: string; onClick: () => void }) {
  return <div className="attention-item"><div className="attention-icon">{icon}</div><div className="attention-copy"><strong>{title}</strong><span>{detail}</span></div><button type="button" className="text-button" onClick={onClick}>{action}</button></div>;
}

function QuickAction({ icon, title, detail, onClick }: { icon: React.ReactNode; title: string; detail: string; onClick: () => void }) {
  return <button className="quick-action" type="button" onClick={onClick}><div className="quick-action-icon">{icon}</div><div><strong>{title}</strong><span>{detail}</span></div><ArrowUpRight size={16} /></button>;
}

function OrdersModule({ orders, selectedOrder, onSelectOrder }: { orders: Order[]; selectedOrder: Order | null; onSelectOrder: (order: Order) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof orderStatuses)[number]>("Todas");
  const [city, setCity] = useState("Todas");
  const [paymentStatus, setPaymentStatus] = useState<(typeof orderPaymentStatuses)[number]>("Todos");
  const cities = ["Todas", ...Array.from(new Set(orders.map((order) => order.city)))];
  const filtered = useMemo(() => orders.filter((order) => {
    const search = `${order.code} ${order.recipient} ${order.sender} ${order.originCity} ${order.city} ${order.storageLocation}`.toLowerCase();
    return (!query || search.includes(query.toLowerCase())) && (status === "Todas" || order.status === status) && (city === "Todas" || order.city === city) && (paymentStatus === "Todos" || order.paymentStatus === paymentStatus);
  }), [city, orders, paymentStatus, query, status]);

  return <div className="module-stack"><section className="module-summary"><div className="summary-icon summary-icon-gold"><Package size={23} /></div><div><strong>{orders.length} encomendas no período</strong><span>Use os filtros para encontrar uma carga por cidade ou situação.</span></div><div className="summary-stats"><span><b>{orders.filter((item) => item.printed).length}</b> etiquetas impressas</span><span><b>{orders.filter((item) => item.status === "Aguardando embarque").length}</b> aguardando embarque</span></div></section>
    <section className="panel list-panel"><div className="filter-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código, pessoa, cidade ou local" aria-label="Buscar encomendas" /></div><div className="select-field"><Filter size={16} /><select value={status} onChange={(event) => setStatus(event.target.value as (typeof orderStatuses)[number])}>{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div><div className="select-field"><MapPin size={16} /><select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div><div className="select-field"><WalletCards size={16} /><select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as (typeof orderPaymentStatuses)[number])}>{orderPaymentStatuses.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div></div><div className="list-meta"><span><strong>{filtered.length}</strong> resultados encontrados</span><span className="list-meta-right"><MapPinned size={15} /> Custódia e cobrança</span></div><div className="orders-table-wrap"><table className="data-table orders-expanded-table"><thead><tr><th>Encomenda</th><th>Pessoas</th><th>Rota</th><th>Local guardado</th><th>Valor</th><th>Pagamento</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} className={selectedOrder?.id === order.id ? "row-selected" : ""} onClick={() => onSelectOrder(order)}><td><div className="table-primary"><span className={`table-icon ${order.paymentStatus === "Pendente" ? "table-icon-warning" : ""}`}><Package size={15} /></span><div><strong>{order.code}</strong><span>{order.receivedAt}</span></div></div></td><td><strong>{order.recipient}</strong><span className="table-secondary">de {order.sender}</span></td><td><div className="destination-cell"><MapPin size={14} />{order.originCity} → {order.city}</div><span className="table-secondary">{order.destination}</span></td><td><span className="category-label">{order.storageLocation}</span></td><td><strong>{formatCurrency(order.amount - order.discount)}</strong><span className="table-secondary">{order.discount ? `desconto ${formatCurrency(order.discount)}` : "sem desconto"}</span></td><td><StatusPill status={order.paymentStatus} /></td><td><StatusPill status={order.status} /></td><td><button className="row-action" type="button" aria-label={`Abrir ${order.code}`} onClick={(event) => { event.stopPropagation(); onSelectOrder(order); }}><ArrowUpRight size={16} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState title="Nenhuma encomenda encontrada" detail="Tente ajustar os filtros ou a busca." />}</div></section>
    <section className="module-tip"><CircleHelp size={18} /><div><strong>Fluxo pensado para o dia a dia</strong><span>Abra uma encomenda para revisar os dados, avançar o status e preparar a etiqueta de impressão.</span></div></section>
  </div>;
}

function StatusPill({ status }: { status: OrderStatus | Suite["status"] | OrderPaymentStatus | BookingPaymentStatus }) {
  return <span className={`status-pill ${statusClass(status)}`}><span className="status-pill-dot" />{status}</span>;
}

function OrderDrawer({ order, onClose, onPrint, onAdvanceStatus }: { order: Order; onClose: () => void; onPrint: () => void; onAdvanceStatus: () => void }) {
  return <div className="drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="order-drawer" role="dialog" aria-modal="true" aria-label={`Detalhes da encomenda ${order.code}`}><div className="drawer-header"><div><span className="eyebrow">Detalhe da encomenda</span><h2>{order.code}</h2></div><button className="icon-button" type="button" aria-label="Fechar detalhes" onClick={onClose}><X size={19} /></button></div><div className="drawer-status-row"><StatusPill status={order.status} /><StatusPill status={order.paymentStatus} /><span className="drawer-date"><Clock3 size={14} /> Recebida em {order.receivedAt}</span></div><div className="drawer-section"><div className="drawer-section-title"><UserRound size={17} /> Pessoas</div><DetailLine label="Destinatário" value={`${order.recipient} · ${order.recipientDocument}`} /><DetailLine label="Remetente" value={`${order.sender} · ${order.senderDocument}`} /><DetailLine label="Contato" value={order.contact} /></div><div className="drawer-section"><div className="drawer-section-title"><MapPin size={17} /> Rota e custódia</div><DetailLine label="Origem → destino" value={`${order.originCity} → ${order.city}`} /><DetailLine label="Local de entrega" value={order.destination} /><DetailLine label="Guardada em" value={order.storageLocation} /><DetailLine label="Atualizado" value={order.storageUpdatedAt} /></div><div className="drawer-section"><div className="drawer-section-title"><CircleDollarSign size={17} /> Cobrança</div><DetailLine label="Valor atribuído" value={formatCurrency(order.amount)} /><DetailLine label="Desconto" value={order.discount ? `${formatCurrency(order.discount)} · ${order.discountNote}` : "Nenhum desconto"} /><DetailLine label="Valor final" value={formatCurrency(order.amount - order.discount)} /></div><div className="drawer-section"><div className="drawer-section-title"><Package size={17} /> Volume</div><DetailLine label="Categoria" value={order.category} /><DetailLine label="Observações" value={order.notes} /></div><div className="label-preview print-card"><div className="label-preview-header"><span>ETIQUETA DE EMBARQUE</span><span className="label-code">{order.code}</span></div><div className="label-destination">{order.city}</div><strong>{order.recipient}</strong><span>{order.destination}</span><div className="label-barcode" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><small>Dados fictícios · Barco José</small></div><div className="drawer-actions"><button className="button button-secondary" type="button" onClick={onPrint}><Printer size={17} /> {order.printed ? "Reimprimir etiqueta" : "Imprimir etiqueta"}</button>{order.status !== "Entregue" && order.status !== "Devolvida" && <button className="button button-primary" type="button" onClick={onAdvanceStatus}><Check size={17} /> Avançar status</button>}</div></aside></div>;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return <div className="detail-line"><span>{label}</span><strong>{value}</strong></div>;
}

function StockModule({ products, sales, financialEntries, onMovement, onSale, onExpense }: { products: Product[]; sales: Sale[]; financialEntries: FinancialEntry[]; onMovement: () => void; onSale: () => void; onExpense: () => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const categories = ["Todas", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()) && (category === "Todas" || product.category === category));
  const revenue = financialEntries.filter((entry) => entry.type === "Receita").reduce((total, entry) => total + entry.amount, 0);
  const expenses = financialEntries.filter((entry) => entry.type === "Despesa").reduce((total, entry) => total + entry.amount, 0);
  return <div className="module-stack"><section className="module-summary stock-summary"><div className="summary-icon summary-icon-blue"><ShoppingBasket size={23} /></div><div><strong>{products.length} produtos cadastrados</strong><span>Controle entradas, saídas, vendas na hora, receitas e despesas demonstrativas.</span></div><div className="stock-summary-legend"><span><i className="legend-dot legend-good" /> {sales.length} vendas registradas</span><span><i className="legend-dot legend-low" /> {products.filter((product) => product.stock <= product.minimum).length} para repor</span></div></section><section className="finance-strip"><div><span>Receitas no período</span><strong>{formatCurrency(revenue)}</strong><small>vendas e outras entradas</small></div><div><span>Despesas no período</span><strong>{formatCurrency(expenses)}</strong><small>lançamentos registrados</small></div><div><span>Resultado demonstrativo</span><strong>{formatCurrency(revenue - expenses)}</strong><small>receitas menos despesas</small></div></section><section className="panel list-panel"><div className="filter-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto ou categoria" aria-label="Buscar produtos" /></div><div className="select-field"><Boxes size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div><button className="button button-outline filter-button" type="button" onClick={onMovement}><ArrowDownToLine size={16} /> Registrar movimento</button><button className="button button-outline filter-button" type="button" onClick={onExpense}><ReceiptText size={16} /> Nova despesa</button><button className="button button-primary filter-button" type="button" onClick={onSale}><Banknote size={16} /> Registrar venda</button></div><div className="list-meta"><span><strong>{filtered.length}</strong> produtos exibidos</span><span className="list-meta-right"><Warehouse size={15} /> Estoque principal</span></div><div className="orders-table-wrap"><table className="data-table stock-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Quantidade atual</th><th>Mínimo</th><th>Local</th><th>Atualizado</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filtered.map((product) => { const low = product.stock <= product.minimum; return <tr key={product.id}><td><div className="table-primary"><span className={`table-icon ${low ? "table-icon-warning" : ""}`}><ShoppingBasket size={15} /></span><div><strong>{product.name}</strong><span>{product.unit}</span></div></div></td><td><span className="category-label">{product.category}</span></td><td><strong>{formatCurrency(product.price)}</strong></td><td><div className="stock-quantity"><strong>{formatNumber(product.stock)}</strong><span className={low ? "stock-low" : "stock-ok"}>{low ? "Repor" : "Disponível"}</span></div></td><td><span className="table-secondary">{formatNumber(product.minimum)} {product.unit}s</span></td><td><span className="table-secondary">{product.location}</span></td><td><span className="table-secondary">{product.updatedAt}</span></td><td><button className="row-action" type="button" aria-label={`Registrar movimento de ${product.name}`} onClick={onMovement}><Pencil size={15} /></button></td></tr>; })}</tbody></table>{filtered.length === 0 && <EmptyState title="Nenhum produto encontrado" detail="Tente ajustar os filtros ou a busca." />}</div></section><div className="overview-grid"><section className="panel"><PanelHeader title="Vendas recentes" description="Registros de vendas na hora" actionLabel="Nova venda" onAction={onSale} /><div className="financial-list">{sales.slice(0, 4).map((sale) => <div className="financial-row" key={sale.id}><div className="financial-icon financial-icon-positive"><Banknote size={16} /></div><div><strong>{sale.code}</strong><span>{sale.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")} · {sale.paymentMethod}</span></div><b>{formatCurrency(sale.total)}</b></div>)}</div></section><section className="panel"><PanelHeader title="Entradas e saídas" description="Receitas e despesas lançadas" actionLabel="Nova despesa" onAction={onExpense} /><div className="financial-list">{financialEntries.slice(0, 4).map((entry) => <div className="financial-row" key={entry.id}><div className={`financial-icon ${entry.type === "Receita" ? "financial-icon-positive" : "financial-icon-negative"}`}>{entry.type === "Receita" ? <ArrowUpRight size={16} /> : <ArrowDownToLine size={16} />}</div><div><strong>{entry.description}</strong><span>{entry.category} · {entry.date}</span></div><b>{entry.type === "Receita" ? "+" : "-"}{formatCurrency(entry.amount)}</b></div>)}</div></section></div><section className="module-tip"><CircleHelp size={18} /><div><strong>Estoque baseado em movimentos</strong><span>Registre entradas e saídas em vez de alterar o saldo sem histórico. Essa base facilita a futura sincronização e auditoria.</span></div></section></div>;
}

function SuitesModule({ suites, bookings, onBooking }: { suites: Suite[]; bookings: Booking[]; onBooking: () => void }) {
  return <div className="module-stack"><section className="suite-overview"><div className="suite-overview-copy"><span className="eyebrow">Mapa de ocupação</span><h2>Dez suítes, uma visão simples.</h2><p>Todas as suítes seguem o mesmo padrão nesta primeira versão. Consulte a disponibilidade e registre os dados dos hóspedes.</p><button className="button button-primary" type="button" onClick={onBooking}><Plus size={17} /> Cadastrar reserva</button></div><div className="suite-counts"><div><strong>{suites.filter((suite) => suite.status === "Livre").length}</strong><span>Livres</span></div><div><strong>{suites.filter((suite) => suite.status === "Ocupada").length}</strong><span>Ocupadas</span></div><div><strong>{suites.filter((suite) => suite.status === "Reservada").length}</strong><span>Reservadas</span></div></div></section><section className="panel suites-panel"><div className="panel-header"><div><h3>Suítes do barco</h3><p>{suites.length} unidades cadastradas · padrão único nesta demonstração</p></div><span className="category-label">Padrão</span></div><div className="suite-grid">{suites.map((suite) => <SuiteCard key={suite.id} suite={suite} />)}</div></section><section className="panel upcoming-panel"><PanelHeader title="Próximas reservas" description="Reservas registradas para a viagem" actionLabel="Nova reserva" onAction={onBooking} />{bookings.length ? <div className="booking-list">{bookings.map((booking) => <div className="booking-row" key={booking.id}><div className="booking-date"><CalendarDays size={16} /><span>{booking.checkIn}<b>até {booking.checkOut}</b></span></div><div className="booking-guest"><strong>{booking.guest}</strong><span>{booking.guestDocument} · {booking.guestContact}</span><small>{booking.guests} hóspede{booking.guests === 1 ? "" : "s"}{booking.notes ? ` · ${booking.notes}` : ""}</small></div><span className="booking-suite">Suíte {suites.find((suite) => suite.id === booking.suiteId)?.number ?? "—"}</span><StatusPill status={booking.paymentStatus} /></div>)}</div> : <EmptyState title="Nenhuma reserva cadastrada" detail="A próxima reserva aparecerá aqui." />}</section></div>;
}

function SuiteCard({ suite }: { suite: Suite }) {
  return <article className={`suite-card suite-card-${suite.status.toLowerCase()}`}><div className="suite-card-top"><span className="suite-number">Suíte {suite.number}</span><StatusPill status={suite.status} /></div><div className="suite-bed-icon"><BedDouble size={27} /></div><h4>{suite.category}</h4><p>{suite.beds} · até {suite.capacity} hóspedes</p>{suite.guest ? <div className="suite-guest"><UserRound size={14} /><span>{suite.guest}</span>{suite.checkout && <small>até {suite.checkout}</small>}</div> : <div className="suite-guest suite-guest-empty"><CircleCheck size={14} /><span>Pronta para reserva</span></div>}</article>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><FileText size={22} /><strong>{title}</strong><span>{detail}</span></div>;
}

function DialogShell({ title, eyebrow, onClose, children }: { title: string; eyebrow: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="dialog-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="dialog-card" role="dialog" aria-modal="true"><div className="dialog-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-button" type="button" aria-label="Fechar janela" onClick={onClose}><X size={19} /></button></div>{children}</section></div>;
}

function OrderDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (order: Order) => void }) {
  const [recipient, setRecipient] = useState("");
  const [recipientDocument, setRecipientDocument] = useState("");
  const [sender, setSender] = useState("");
  const [senderDocument, setSenderDocument] = useState("");
  const [originCity, setOriginCity] = useState("Manaus");
  const [city, setCity] = useState("Manacapuru");
  const [category, setCategory] = useState<OrderCategory>("Caixa");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [discountNote, setDiscountNote] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>("Pendente");
  const [storageLocation, setStorageLocation] = useState<StorageLocation>("Sala de Encomendas 1");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sequence = 24092 + Math.floor(Math.random() * 7);
    onSubmit({ id: `ord-${Date.now()}`, code: `EN-${sequence}`, recipient, recipientDocument: recipientDocument || "Não informado", sender, senderDocument: senderDocument || "Não informado", originCity, city, destination: `Porto de ${city}`, category, status: "Guardada", receivedAt: "Agora", contact: contact || "Não informado", notes: notes || "Sem observações.", printed: false, amount: Math.max(0, Number(amount) || 0), discount: Math.max(0, Number(discount) || 0), discountNote: discountNote || "Sem observação de desconto", paymentStatus, storageLocation, storageUpdatedAt: "Agora" });
  }
  return <DialogShell eyebrow="Recebimento de carga" title="Nova encomenda" onClose={onClose}><form className="dialog-form" onSubmit={submit}><div className="demo-notice"><Sparkles size={16} /><span>Este registro é fictício e será salvo apenas neste navegador.</span></div><div className="form-grid"><Field label="Destinatário" required><input required value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Nome de quem receberá" /></Field><Field label="CPF ou RG do destinatário"><input value={recipientDocument} onChange={(event) => setRecipientDocument(event.target.value)} placeholder="Documento" /></Field><Field label="Remetente" required><input required value={sender} onChange={(event) => setSender(event.target.value)} placeholder="Nome de quem está enviando" /></Field><Field label="CPF ou RG do remetente"><input value={senderDocument} onChange={(event) => setSenderDocument(event.target.value)} placeholder="Documento" /></Field><Field label="Município de origem" required><input required value={originCity} onChange={(event) => setOriginCity(event.target.value)} placeholder="Ex.: Manaus" /></Field><Field label="Município de destino" required><input required value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ex.: Manacapuru" /></Field><Field label="Categoria"><select value={category} onChange={(event) => setCategory(event.target.value as OrderCategory)}><option>Caixa</option><option>Documentos</option><option>Frágil</option><option>Perecível</option></select></Field><Field label="Local guardado"><select value={storageLocation} onChange={(event) => setStorageLocation(event.target.value as StorageLocation)}>{storageLocations.map((location) => <option key={location}>{location}</option>)}</select></Field><Field label="Contato"><input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Telefone ou referência" /></Field><Field label="Valor atribuído"><input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field><Field label="Desconto"><input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} /></Field><Field label="Status do pagamento"><select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as OrderPaymentStatus)}>{orderPaymentStatuses.filter((item) => item !== "Todos").map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Observação do desconto"><input value={discountNote} onChange={(event) => setDiscountNote(event.target.value)} placeholder="Ex.: cliente recorrente" /></Field><Field label="Observações gerais" wide><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Informações importantes para o transporte" rows={3} /></Field></div><div className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={17} /> Salvar encomenda</button></div></form></DialogShell>;
}

function StockDialog({ products, onClose, onSubmit }: { products: Product[]; onClose: () => void; onSubmit: (productId: string, type: "entry" | "exit", quantity: number) => void }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<"entry" | "exit">("entry");
  const [quantity, setQuantity] = useState("1");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(productId, type, Math.max(1, Number(quantity) || 1)); }
  return <DialogShell eyebrow="Lanchonete de bordo" title="Registrar movimento" onClose={onClose}><form className="dialog-form" onSubmit={submit}><div className="demo-notice"><Boxes size={16} /><span>O estoque usa movimentos para manter um histórico claro.</span></div><div className="form-grid"><Field label="Produto" wide><select value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · saldo {product.stock}</option>)}</select></Field><Field label="Tipo de movimento"><select value={type} onChange={(event) => setType(event.target.value as "entry" | "exit")}><option value="entry">Entrada</option><option value="exit">Saída</option></select></Field><Field label="Quantidade"><input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field></div><div className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={17} /> Registrar movimento</button></div></form></DialogShell>;
}

function BookingDialog({ suites, onClose, onSubmit }: { suites: Suite[]; onClose: () => void; onSubmit: (booking: Booking) => void }) {
  const available = suites.filter((suite) => suite.status === "Livre");
  const [suiteId, setSuiteId] = useState(available[0]?.id ?? "");
  const [guest, setGuest] = useState("");
  const [guestDocument, setGuestDocument] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [guests, setGuests] = useState("1");
  const [checkIn, setCheckIn] = useState("05 out");
  const [checkOut, setCheckOut] = useState("08 out");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<BookingPaymentStatus>("Pago (simulado)");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit({ id: `book-${Date.now()}`, suiteId, guest, guestDocument: guestDocument || "Não informado", guestContact: guestContact || "Não informado", guests: Math.max(1, Number(guests) || 1), checkIn, checkOut, notes: notes || "Sem observações.", paymentStatus, status: "Confirmada" }); }
  return <DialogShell eyebrow="Hospedagem a bordo" title="Nova reserva" onClose={onClose}><form className="dialog-form" onSubmit={submit}><div className="demo-notice"><CreditCard size={16} /><span>O pagamento online é simulado neste MVP e não movimenta dinheiro real.</span></div>{available.length === 0 ? <EmptyState title="Nenhuma suíte livre" detail="Libere uma suíte antes de cadastrar uma reserva." /> : <><div className="form-grid"><Field label="Suíte" wide><select value={suiteId} onChange={(event) => setSuiteId(event.target.value)}>{available.map((suite) => <option key={suite.id} value={suite.id}>Suíte {suite.number} · {suite.category}</option>)}</select></Field><Field label="Hóspede responsável" required><input required value={guest} onChange={(event) => setGuest(event.target.value)} placeholder="Nome completo" /></Field><Field label="CPF" required><input required value={guestDocument} onChange={(event) => setGuestDocument(event.target.value)} placeholder="CPF do hóspede" /></Field><Field label="Contato" required><input required value={guestContact} onChange={(event) => setGuestContact(event.target.value)} placeholder="Telefone ou WhatsApp" /></Field><Field label="Quantidade de hóspedes"><input type="number" min="1" value={guests} onChange={(event) => setGuests(event.target.value)} /></Field><Field label="Entrada"><input required value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></Field><Field label="Saída"><input required value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></Field><Field label="Status do pagamento"><select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as BookingPaymentStatus)}>{bookingPaymentStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Observações" wide><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Itens relevantes fora da suíte, como carro ou carga" rows={3} /></Field></div><div className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={17} /> Confirmar reserva</button></div></>}</form></DialogShell>;
}

function SaleDialog({ products, onClose, onSubmit }: { products: Product[]; onClose: () => void; onSubmit: (sale: Sale) => void }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>("PIX");
  const product = products.find((item) => item.id === productId);
  const parsedQuantity = Math.max(1, Number(quantity) || 1);
  const total = (product?.price ?? 0) * parsedQuantity;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || parsedQuantity > product.stock) return;
    const code = `VD-${180 + Math.floor(Math.random() * 80)}`;
    onSubmit({ id: `sale-${Date.now()}`, code, items: [{ productId: product.id, productName: product.name, quantity: parsedQuantity, unitPrice: product.price, total }], total, paymentMethod, soldAt: "Hoje, agora", period: "Semana" });
  }
  return <DialogShell eyebrow="Lanchonete de bordo" title="Registrar venda" onClose={onClose}><form className="dialog-form" onSubmit={submit}><div className="demo-notice"><Banknote size={16} /><span>Ao salvar, o produto é baixado do estoque e a receita entra nos relatórios.</span></div><div className="form-grid"><Field label="Produto" wide><select value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatCurrency(item.price)} · saldo {item.stock}</option>)}</select></Field><Field label="Quantidade"><input type="number" min="1" max={product?.stock ?? 1} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field><Field label="Forma de pagamento"><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as SalePaymentMethod)}><option>PIX</option><option>Cartão</option><option>Dinheiro</option><option>Pendente</option></select></Field></div><div className="dialog-total"><span>Total da venda</span><strong>{formatCurrency(total)}</strong></div>{product && parsedQuantity > product.stock && <p className="form-error">A quantidade informada é maior que o saldo disponível.</p>}<div className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit" disabled={!product || parsedQuantity > (product?.stock ?? 0)}><Check size={17} /> Salvar venda</button></div></form></DialogShell>;
}

function ExpenseDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (entry: FinancialEntry) => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Operacional");
  const [period, setPeriod] = useState<ReportPeriod>("Semana");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ id: `fin-${Date.now()}`, type: "Despesa", description, amount: Math.max(0, Number(amount) || 0), category, source: "Lançamento manual", date: "Hoje, agora", period });
  }
  return <DialogShell eyebrow="Controle financeiro" title="Nova despesa" onClose={onClose}><form className="dialog-form" onSubmit={submit}><div className="demo-notice"><ReceiptText size={16} /><span>O lançamento é fictício e aparece nos relatórios da semana ou do mês.</span></div><div className="form-grid"><Field label="Descrição" required wide><input required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex.: compra de bebidas" /></Field><Field label="Valor" required><input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field><Field label="Categoria"><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Operacional</option><option>Reposição</option><option>Manutenção</option><option>Outros</option></select></Field><Field label="Período do relatório"><select value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)}><option>Semana</option><option>Mês</option></select></Field></div><div className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={17} /> Lançar despesa</button></div></form></DialogShell>;
}

function ReportsModule({ orders, products, sales, financialEntries, suites, bookings }: { orders: Order[]; products: Product[]; sales: Sale[]; financialEntries: FinancialEntry[]; suites: Suite[]; bookings: Booking[] }) {
  const [period, setPeriod] = useState<ReportPeriod>("Semana");
  const scopedEntries = financialEntries.filter((entry) => period === "Mês" || entry.period === "Semana");
  const scopedSales = sales.filter((sale) => period === "Mês" || sale.period === "Semana");
  const revenue = scopedEntries.filter((entry) => entry.type === "Receita").reduce((total, entry) => total + entry.amount, 0);
  const expenses = scopedEntries.filter((entry) => entry.type === "Despesa").reduce((total, entry) => total + entry.amount, 0);
  const pendingOrders = orders.filter((order) => order.paymentStatus === "Pendente" || order.paymentStatus === "Pago no destino").length;
  const occupiedSuites = suites.filter((suite) => suite.status === "Ocupada" || suite.status === "Reservada").length;
  return <div className="module-stack"><section className="report-header"><div><span className="eyebrow">Consolidação demonstrativa</span><h2>O que merece atenção neste período?</h2><p>Selecione semana ou mês para revisar receitas, despesas e os principais indicadores operacionais.</p></div><div className="period-tabs" role="group" aria-label="Período dos relatórios"><button type="button" className={period === "Semana" ? "period-tab-active" : ""} onClick={() => setPeriod("Semana")}>Semana</button><button type="button" className={period === "Mês" ? "period-tab-active" : ""} onClick={() => setPeriod("Mês")}>Mês</button></div></section><section className="report-metric-grid"><ReportMetric icon={<CircleDollarSign size={19} />} label="Receitas" value={formatCurrency(revenue)} detail={`${scopedSales.length} vendas`} tone="positive" /><ReportMetric icon={<ReceiptText size={19} />} label="Despesas" value={formatCurrency(expenses)} detail="lançamentos no período" tone="negative" /><ReportMetric icon={<Package size={19} />} label="Encomendas pendentes" value={formatNumber(pendingOrders)} detail="pagamento a conferir" tone="gold" /><ReportMetric icon={<BedDouble size={19} />} label="Suítes ocupadas/reservadas" value={`${occupiedSuites}/${suites.length}`} detail={`${bookings.length} reservas cadastradas`} tone="blue" /></section><div className="overview-grid"><section className="panel"><PanelHeader title="Movimentação financeira" description={period === "Mês" ? "Receitas e despesas do mês" : "Receitas e despesas da semana"} /><div className="financial-list">{scopedEntries.slice(0, 8).map((entry) => <div className="financial-row" key={entry.id}><div className={`financial-icon ${entry.type === "Receita" ? "financial-icon-positive" : "financial-icon-negative"}`}>{entry.type === "Receita" ? <ArrowUpRight size={16} /> : <ArrowDownToLine size={16} />}</div><div><strong>{entry.description}</strong><span>{entry.category} · {entry.date}</span></div><b>{entry.type === "Receita" ? "+" : "-"}{formatCurrency(entry.amount)}</b></div>)}</div></section><section className="panel"><PanelHeader title="Resumo operacional" description="Indicadores para a conferência da equipe" /><div className="report-check-list"><div><BadgeCheck size={17} /><span><strong>{orders.length}</strong> encomendas cadastradas</span></div><div><Boxes size={17} /><span><strong>{products.filter((product) => product.stock <= product.minimum).length}</strong> produtos abaixo do mínimo</span></div><div><BedDouble size={17} /><span><strong>{suites.filter((suite) => suite.status === "Livre").length}</strong> suítes livres para reserva</span></div><div><MapPinned size={17} /><span><strong>{new Set(orders.map((order) => order.city)).size}</strong> municípios de destino</span></div></div></section></div><section className="module-tip"><CircleHelp size={18} /><div><strong>Relatórios preparados para validação do fluxo</strong><span>Os dados são fictícios e os filtros financeiros usam a marcação de período de cada lançamento. A regra fiscal e o fechamento oficial ainda dependem da especificação do cliente.</span></div></section></div>;
}

function ReportMetric({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string }) {
  return <div className="report-metric"><div className={`report-metric-icon report-metric-${tone}`}>{icon}</div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) {
  return <label className={`form-field ${wide ? "form-field-wide" : ""}`}><span>{label}{required && <em> *</em>}</span>{children}</label>;
}
