"use client";

import {
  AlertTriangle,
  Anchor,
  ArrowDownToLine,
  ArrowUpRight,
  BedDouble,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  Clock3,
  CloudOff,
  CloudUpload,
  DoorOpen,
  FileText,
  Filter,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Warehouse,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Booking,
  initialBookings,
  initialOrders,
  initialProducts,
  initialSuites,
  ModuleKey,
  Order,
  OrderCategory,
  OrderStatus,
  Product,
  Suite,
  SuiteCategory,
} from "@/lib/demo-data";

const STORAGE_KEY = "barco-jose-mvp-state-v1";

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
    label: "Estoque",
    eyebrow: "Mercadinho de bordo",
    title: "Controle de estoque",
    description: "Registre entradas, saídas e mantenha os produtos do mercado sob controle.",
  },
  suites: {
    label: "Suítes",
    eyebrow: "Hospedagem a bordo",
    title: "Disponibilidade de suítes",
    description: "Veja a ocupação e registre reservas conforme o período da viagem.",
  },
};

const orderStatuses: Array<OrderStatus | "Todas"> = ["Todas", "Aguardando embarque", "Em trânsito", "Entregue", "Devolvida"];

function statusClass(status: OrderStatus | Suite["status"]) {
  const normalized = status.toLowerCase();
  if (normalized.includes("entregue") || normalized.includes("livre")) return "status-positive";
  if (normalized.includes("trânsito") || normalized.includes("reservada") || normalized.includes("ocupada")) return "status-info";
  if (normalized.includes("devolvida") || normalized.includes("limpeza")) return "status-warning";
  return "status-neutral";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function nextOrderStatus(status: OrderStatus): OrderStatus {
  if (status === "Aguardando embarque") return "Em trânsito";
  if (status === "Em trânsito") return "Entregue";
  return status;
}

export function BarcoDashboard() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("overview");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
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
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { orders?: Order[]; products?: Product[]; suites?: Suite[]; bookings?: Booking[] };
          if (parsed.orders) setOrders(parsed.orders);
          if (parsed.products) setProducts(parsed.products);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ orders, products, suites, bookings }));
  }, [bookings, isHydrated, orders, products, suites]);

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
  }), [orders, products, suites]);

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
          <NavItem icon={<ShoppingBasket size={18} />} label="Estoque" active={activeModule === "stock"} badge={metrics.productsLow} onClick={() => goTo("stock")} />
          <NavItem icon={<BedDouble size={18} />} label="Suítes" active={activeModule === "suites"} onClick={() => goTo("suites")} />
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
              {activeModule === "stock" && <button className="button button-primary" type="button" onClick={() => setStockDialogOpen(true)}><ArrowDownToLine size={17} /> Registrar movimento</button>}
              {activeModule === "suites" && <button className="button button-primary" type="button" onClick={() => setBookingDialogOpen(true)}><Plus size={17} /> Nova reserva</button>}
            </div>
          </div>

          {activeModule === "overview" && <Overview metrics={metrics} orders={orders} products={products} suites={suites} onNavigate={goTo} onSelectOrder={setSelectedOrder} />}
          {activeModule === "orders" && <OrdersModule orders={orders} selectedOrder={selectedOrder} onSelectOrder={setSelectedOrder} />}
          {activeModule === "stock" && <StockModule products={products} onMovement={() => setStockDialogOpen(true)} />}
          {activeModule === "suites" && <SuitesModule suites={suites} bookings={bookings} onBooking={() => setBookingDialogOpen(true)} />}
        </div>
      </main>

      <div className="floating-sync-area">
        <button className="floating-sync" type="button" onClick={syncDemo}><RefreshCw size={16} /> Sincronizar demonstração</button>
      </div>

      {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onPrint={() => handlePrint(selectedOrder)} onAdvanceStatus={handleOrderStatusChange} />}
      {orderDialogOpen && <OrderDialog onClose={() => setOrderDialogOpen(false)} onSubmit={handleOrderCreated} />}
      {stockDialogOpen && <StockDialog products={products} onClose={() => setStockDialogOpen(false)} onSubmit={handleStockMovement} />}
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
      <div className="hero-copy"><span className="hero-kicker"><Sparkles size={15} /> Resumo da operação</span><h2>Clareza para cada etapa da viagem.</h2><p>Tenha uma visão rápida das encomendas, do estoque e das suítes em um só lugar.</p><button className="button button-light" type="button" onClick={() => onNavigate("orders")}>Ver encomendas <ArrowUpRight size={16} /></button></div>
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
      <section className="panel attention-panel"><PanelHeader title="Pontos de atenção" description="Itens que merecem uma conferência" /><div className="attention-list"><AttentionItem icon={<AlertTriangle size={18} />} title={`${metrics.productsLow} produto${metrics.productsLow === 1 ? "" : "s"} abaixo do mínimo`} detail="Revise o estoque do mercadinho" action="Ver estoque" onClick={() => onNavigate("stock")} /><AttentionItem icon={<Clock3 size={18} />} title={`${metrics.ordersPending} encomendas aguardando`} detail="Prontas para organizar no embarque" action="Organizar" onClick={() => onNavigate("orders")} /><AttentionItem icon={<CalendarDays size={18} />} title="Próxima saída amanhã" detail="Confira reservas e suítes" action="Ver suítes" onClick={() => onNavigate("suites")} /></div></section>
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
  const cities = ["Todas", ...Array.from(new Set(orders.map((order) => order.city)))];
  const filtered = useMemo(() => orders.filter((order) => {
    const search = `${order.code} ${order.recipient} ${order.sender} ${order.city}`.toLowerCase();
    return (!query || search.includes(query.toLowerCase())) && (status === "Todas" || order.status === status) && (city === "Todas" || order.city === city);
  }), [city, orders, query, status]);

  return <div className="module-stack"><section className="module-summary"><div className="summary-icon summary-icon-gold"><Package size={23} /></div><div><strong>{orders.length} encomendas no período</strong><span>Use os filtros para encontrar uma carga por cidade ou situação.</span></div><div className="summary-stats"><span><b>{orders.filter((item) => item.printed).length}</b> etiquetas impressas</span><span><b>{orders.filter((item) => item.status === "Aguardando embarque").length}</b> aguardando embarque</span></div></section>
    <section className="panel list-panel"><div className="filter-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código, pessoa ou cidade" aria-label="Buscar encomendas" /></div><div className="select-field"><Filter size={16} /><select value={status} onChange={(event) => setStatus(event.target.value as (typeof orderStatuses)[number])}>{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div><div className="select-field"><MapPin size={16} /><select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div></div><div className="list-meta"><span><strong>{filtered.length}</strong> resultados encontrados</span><button className="view-options" type="button"><SlidersHorizontal size={15} /> Ajustar colunas</button></div><div className="orders-table-wrap"><table className="data-table"><thead><tr><th>Encomenda</th><th>Destinatário</th><th>Destino</th><th>Categoria</th><th>Status</th><th>Recebida em</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} className={selectedOrder?.id === order.id ? "row-selected" : ""} onClick={() => onSelectOrder(order)}><td><div className="table-primary"><span className="table-icon"><Package size={15} /></span><div><strong>{order.code}</strong><span>{order.sender}</span></div></div></td><td><strong>{order.recipient}</strong><span className="table-secondary">{order.contact}</span></td><td><div className="destination-cell"><MapPin size={14} />{order.city}</div><span className="table-secondary">{order.destination}</span></td><td><span className="category-label">{order.category}</span></td><td><StatusPill status={order.status} /></td><td><span className="table-secondary">{order.receivedAt}</span></td><td><button className="row-action" type="button" aria-label={`Abrir ${order.code}`} onClick={(event) => { event.stopPropagation(); onSelectOrder(order); }}><ArrowUpRight size={16} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState title="Nenhuma encomenda encontrada" detail="Tente ajustar os filtros ou a busca." />}</div></section>
    <section className="module-tip"><CircleHelp size={18} /><div><strong>Fluxo pensado para o dia a dia</strong><span>Abra uma encomenda para revisar os dados, avançar o status e preparar a etiqueta de impressão.</span></div></section>
  </div>;
}

function StatusPill({ status }: { status: OrderStatus | Suite["status"] }) {
  return <span className={`status-pill ${statusClass(status)}`}><span className="status-pill-dot" />{status}</span>;
}

function OrderDrawer({ order, onClose, onPrint, onAdvanceStatus }: { order: Order; onClose: () => void; onPrint: () => void; onAdvanceStatus: () => void }) {
  return <div className="drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="order-drawer" role="dialog" aria-modal="true" aria-label={`Detalhes da encomenda ${order.code}`}><div className="drawer-header"><div><span className="eyebrow">Detalhe da encomenda</span><h2>{order.code}</h2></div><button className="icon-button" type="button" aria-label="Fechar detalhes" onClick={onClose}><X size={19} /></button></div><div className="drawer-status-row"><StatusPill status={order.status} /><span className="drawer-date"><Clock3 size={14} /> Recebida em {order.receivedAt}</span></div><div className="drawer-section"><div className="drawer-section-title"><UserRound size={17} /> Pessoas</div><DetailLine label="Destinatário" value={order.recipient} /><DetailLine label="Remetente" value={order.sender} /><DetailLine label="Contato" value={order.contact} /></div><div className="drawer-section"><div className="drawer-section-title"><MapPin size={17} /> Destino</div><DetailLine label="Cidade" value={order.city} /><DetailLine label="Local" value={order.destination} /></div><div className="drawer-section"><div className="drawer-section-title"><Package size={17} /> Volume</div><DetailLine label="Categoria" value={order.category} /><DetailLine label="Observações" value={order.notes} /></div><div className="label-preview print-card"><div className="label-preview-header"><span>ETIQUETA DE EMBARQUE</span><span className="label-code">{order.code}</span></div><div className="label-destination">{order.city}</div><strong>{order.recipient}</strong><span>{order.destination}</span><div className="label-barcode" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><small>Dados fictícios · Barco José</small></div><div className="drawer-actions"><button className="button button-secondary" type="button" onClick={onPrint}><Printer size={17} /> {order.printed ? "Reimprimir etiqueta" : "Imprimir etiqueta"}</button>{order.status !== "Entregue" && order.status !== "Devolvida" && <button className="button button-primary" type="button" onClick={onAdvanceStatus}><Check size={17} /> Avançar status</button>}</div></aside></div>;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return <div className="detail-line"><span>{label}</span><strong>{value}</strong></div>;
}

function StockModule({ products, onMovement }: { products: Product[]; onMovement: () => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const categories = ["Todas", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()) && (category === "Todas" || product.category === category));
  return <div className="module-stack"><section className="module-summary stock-summary"><div className="summary-icon summary-icon-blue"><ShoppingBasket size={23} /></div><div><strong>{products.length} produtos cadastrados</strong><span>O saldo abaixo é fictício e será substituído pelo estoque real na próxima etapa.</span></div><div className="stock-summary-legend"><span><i className="legend-dot legend-good" /> Dentro do mínimo</span><span><i className="legend-dot legend-low" /> Precisa repor</span></div></section><section className="panel list-panel"><div className="filter-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto ou categoria" aria-label="Buscar produtos" /></div><div className="select-field"><Boxes size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div><button className="button button-outline filter-button" type="button" onClick={onMovement}><ArrowDownToLine size={16} /> Registrar movimento</button></div><div className="list-meta"><span><strong>{filtered.length}</strong> produtos exibidos</span><span className="list-meta-right"><Warehouse size={15} /> Estoque principal</span></div><div className="orders-table-wrap"><table className="data-table stock-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Quantidade atual</th><th>Mínimo</th><th>Local</th><th>Atualizado</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filtered.map((product) => { const low = product.stock <= product.minimum; return <tr key={product.id}><td><div className="table-primary"><span className={`table-icon ${low ? "table-icon-warning" : ""}`}><ShoppingBasket size={15} /></span><div><strong>{product.name}</strong><span>{product.unit}</span></div></div></td><td><span className="category-label">{product.category}</span></td><td><div className="stock-quantity"><strong>{formatNumber(product.stock)}</strong><span className={low ? "stock-low" : "stock-ok"}>{low ? "Repor" : "Disponível"}</span></div></td><td><span className="table-secondary">{formatNumber(product.minimum)} {product.unit}s</span></td><td><span className="table-secondary">{product.location}</span></td><td><span className="table-secondary">{product.updatedAt}</span></td><td><button className="row-action" type="button" aria-label={`Editar ${product.name}`} onClick={onMovement}><Pencil size={15} /></button></td></tr>; })}</tbody></table>{filtered.length === 0 && <EmptyState title="Nenhum produto encontrado" detail="Tente ajustar os filtros ou a busca." />}</div></section><section className="module-tip"><CircleHelp size={18} /><div><strong>Estoque baseado em movimentos</strong><span>Registre entradas e saídas em vez de alterar o saldo sem histórico. Essa base facilita a futura sincronização e auditoria.</span></div></section></div>;
}

function SuitesModule({ suites, bookings, onBooking }: { suites: Suite[]; bookings: Booking[]; onBooking: () => void }) {
  const [category, setCategory] = useState<"Todas" | SuiteCategory>("Todas");
  const filtered = suites.filter((suite) => category === "Todas" || suite.category === category);
  return <div className="module-stack"><section className="suite-overview"><div className="suite-overview-copy"><span className="eyebrow">Mapa de ocupação</span><h2>Uma cabine livre é uma oportunidade.</h2><p>Consulte rapidamente as suítes por tipo de cama e acompanhe as próximas reservas da viagem.</p><button className="button button-primary" type="button" onClick={onBooking}><Plus size={17} /> Cadastrar reserva</button></div><div className="suite-counts"><div><strong>{suites.filter((suite) => suite.status === "Livre").length}</strong><span>Livres</span></div><div><strong>{suites.filter((suite) => suite.status === "Ocupada").length}</strong><span>Ocupadas</span></div><div><strong>{suites.filter((suite) => suite.status === "Reservada").length}</strong><span>Reservadas</span></div></div></section><section className="panel suites-panel"><div className="panel-header"><div><h3>Suítes do barco</h3><p>Selecione uma categoria para facilitar a busca.</p></div><div className="category-tabs"><button className={category === "Todas" ? "category-tab-active" : ""} type="button" onClick={() => setCategory("Todas")}>Todas</button><button className={category === "Cama de casal" ? "category-tab-active" : ""} type="button" onClick={() => setCategory("Cama de casal")}>Cama de casal</button><button className={category === "Cama de solteiro" ? "category-tab-active" : ""} type="button" onClick={() => setCategory("Cama de solteiro")}>Cama de solteiro</button></div></div><div className="suite-grid">{filtered.map((suite) => <SuiteCard key={suite.id} suite={suite} />)}</div></section><section className="panel upcoming-panel"><PanelHeader title="Próximas reservas" description="Reservas registradas para a viagem" actionLabel="Nova reserva" onAction={onBooking} />{bookings.length ? <div className="booking-list">{bookings.map((booking) => <div className="booking-row" key={booking.id}><div className="booking-date"><CalendarDays size={16} /><span>{booking.checkIn}<b>até {booking.checkOut}</b></span></div><div className="booking-guest"><strong>{booking.guest}</strong><span>{booking.guests} hóspede{booking.guests === 1 ? "" : "s"}</span></div><span className="booking-suite">Suíte {suites.find((suite) => suite.id === booking.suiteId)?.number ?? "—"}</span><StatusPill status="Reservada" /></div>)}</div> : <EmptyState title="Nenhuma reserva cadastrada" detail="A próxima reserva aparecerá aqui." />}</section></div>;
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
  const [sender, setSender] = useState("");
  const [city, setCity] = useState("Manacapuru");
  const [category, setCategory] = useState<OrderCategory>("Caixa");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sequence = 24092 + Math.floor(Math.random() * 7);
    onSubmit({ id: `ord-${Date.now()}`, code: `EN-${sequence}`, recipient, sender, city, destination: `Porto de ${city}`, category, status: "Aguardando embarque", receivedAt: "Agora", contact: contact || "Não informado", notes: notes || "Sem observações.", printed: false });
  }
  return <DialogShell eyebrow="Recebimento de carga" title="Nova encomenda" onClose={onClose}><form className="dialog-form" onSubmit={submit}><div className="demo-notice"><Sparkles size={16} /><span>Este registro é fictício e será salvo apenas neste navegador.</span></div><div className="form-grid"><Field label="Destinatário" required><input required value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Nome de quem receberá" /></Field><Field label="Remetente" required><input required value={sender} onChange={(event) => setSender(event.target.value)} placeholder="Nome de quem está enviando" /></Field><Field label="Cidade de destino" required><input required value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ex.: Manacapuru" /></Field><Field label="Categoria"><select value={category} onChange={(event) => setCategory(event.target.value as OrderCategory)}><option>Caixa</option><option>Documentos</option><option>Frágil</option><option>Perecível</option></select></Field><Field label="Contato"><input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Telefone ou referência" /></Field><Field label="Local de entrega"><input value={`Porto de ${city}`} readOnly /></Field><Field label="Observações" wide><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Informações importantes para o transporte" rows={3} /></Field></div><div className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={17} /> Salvar encomenda</button></div></form></DialogShell>;
}

function StockDialog({ products, onClose, onSubmit }: { products: Product[]; onClose: () => void; onSubmit: (productId: string, type: "entry" | "exit", quantity: number) => void }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<"entry" | "exit">("entry");
  const [quantity, setQuantity] = useState("1");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(productId, type, Math.max(1, Number(quantity) || 1)); }
  return <DialogShell eyebrow="Mercadinho de bordo" title="Registrar movimento" onClose={onClose}><form className="dialog-form" onSubmit={submit}><div className="demo-notice"><Boxes size={16} /><span>O estoque usa movimentos para manter um histórico claro.</span></div><div className="form-grid"><Field label="Produto" wide><select value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · saldo {product.stock}</option>)}</select></Field><Field label="Tipo de movimento"><select value={type} onChange={(event) => setType(event.target.value as "entry" | "exit")}><option value="entry">Entrada</option><option value="exit">Saída</option></select></Field><Field label="Quantidade"><input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field></div><div className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={17} /> Registrar movimento</button></div></form></DialogShell>;
}

function BookingDialog({ suites, onClose, onSubmit }: { suites: Suite[]; onClose: () => void; onSubmit: (booking: Booking) => void }) {
  const available = suites.filter((suite) => suite.status === "Livre");
  const [suiteId, setSuiteId] = useState(available[0]?.id ?? "");
  const [guest, setGuest] = useState("");
  const [guests, setGuests] = useState("1");
  const [checkIn, setCheckIn] = useState("05 out");
  const [checkOut, setCheckOut] = useState("08 out");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit({ id: `book-${Date.now()}`, suiteId, guest, guests: Math.max(1, Number(guests) || 1), checkIn, checkOut, status: "Confirmada" }); }
  return <DialogShell eyebrow="Hospedagem a bordo" title="Nova reserva" onClose={onClose}><form className="dialog-form" onSubmit={submit}><div className="demo-notice"><CalendarDays size={16} /><span>As datas estão simplificadas para a validação do fluxo.</span></div>{available.length === 0 ? <EmptyState title="Nenhuma suíte livre" detail="Libere uma suíte antes de cadastrar uma reserva." /> : <><div className="form-grid"><Field label="Suíte" wide><select value={suiteId} onChange={(event) => setSuiteId(event.target.value)}>{available.map((suite) => <option key={suite.id} value={suite.id}>Suíte {suite.number} · {suite.category}</option>)}</select></Field><Field label="Hóspede responsável" required><input required value={guest} onChange={(event) => setGuest(event.target.value)} placeholder="Nome completo" /></Field><Field label="Quantidade de hóspedes"><input type="number" min="1" value={guests} onChange={(event) => setGuests(event.target.value)} /></Field><Field label="Entrada"><input required value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></Field><Field label="Saída"><input required value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></Field></div><div className="dialog-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit"><Check size={17} /> Confirmar reserva</button></div></>}</form></DialogShell>;
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) {
  return <label className={`form-field ${wide ? "form-field-wide" : ""}`}><span>{label}{required && <em> *</em>}</span>{children}</label>;
}
