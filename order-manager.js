// Order Manager - Gerenciamento de Pedidos com Firebase
import { firebaseService } from './firebase-config.js';
import authManager from './auth-manager.js';

class OrderManager {
  constructor() {
    this.orders = [];
    this.initializeOrders();
  }

  // Inicializar pedidos do Firebase
  async initializeOrders() {
    try {
      const result = await firebaseService.getOrders();
      if (result.success) {
        this.orders = result.orders;
      } else {
        console.error('Erro ao carregar pedidos:', result.error);
      }
    } catch (error) {
      console.error('Erro na inicialização de pedidos:', error);
    }

    // Listener para atualizações em tempo real
    firebaseService.onOrdersChange((snapshot) => {
      this.orders = [];
      snapshot.forEach((doc) => {
        this.orders.push({ id: doc.id, ...doc.data() });
      });
      this.updateOrdersUI();
    });
  }

  // Criar novo pedido
  async createOrder(orderData) {
    if (!authManager.isAuthenticated) {
      authManager.showError('Faça login para criar um pedido');
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      authManager.showLoading('Processando pedido...');

      // Preparar dados do pedido
      const order = {
        userId: authManager.currentUser.uid,
        userEmail: authManager.currentUser.email,
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod || 'Cartão de Crédito',
        deliveryAddress: orderData.deliveryAddress,
        status: 'pendente',
        orderNumber: this.generateOrderNumber(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await firebaseService.createOrder(order);
      
      if (result.success) {
        authManager.showSuccess('Pedido criado com sucesso!');
        
        // Limpar carrinho após criar pedido
        if (window.productManager) {
          window.productManager.clearCart();
        }
        
        return { success: true, id: result.id, orderNumber: order.orderNumber };
      } else {
        authManager.showError('Erro ao criar pedido: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      authManager.showError('Erro inesperado ao criar pedido');
      return { success: false, error: error.message };
    } finally {
      authManager.hideLoading();
    }
  }

  // Obter pedidos do usuário atual
  async getUserOrders() {
    if (!authManager.isAuthenticated) {
      return { success: false, orders: [] };
    }

    try {
      const result = await firebaseService.getOrders(authManager.currentUser.uid);
      return result;
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      return { success: false, error: error.message };
    }
  }

  // Obter todos os pedidos (admin)
  async getAllOrders() {
    if (!authManager.requireAdmin()) {
      return { success: false, error: 'Acesso negado' };
    }

    try {
      const result = await firebaseService.getOrders();
      return result;
    } catch (error) {
      console.error('Erro ao buscar todos os pedidos:', error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar status do pedido (admin)
  async updateOrderStatus(orderId, newStatus) {
    if (!authManager.requireAdmin()) {
      return { success: false, error: 'Acesso negado' };
    }

    try {
      const result = await firebaseService.updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        authManager.showSuccess('Status do pedido atualizado com sucesso!');
        return { success: true };
      } else {
        authManager.showError('Erro ao atualizar status: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      authManager.showError('Erro inesperado ao atualizar status');
      return { success: false, error: error.message };
    }
  }

  // Gerar número do pedido
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `${year}${month}${day}${random}`;
  }

  // Renderizar pedidos para cliente
  renderUserOrders() {
    const ordersContainer = document.querySelector('.user-orders, .orders-container');
    if (!ordersContainer) return;

    this.getUserOrders().then(result => {
      if (!result.success) {
        ordersContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Erro ao carregar pedidos: ${result.error}</p>
          </div>
        `;
        return;
      }

      const orders = result.orders;

      if (orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="no-orders">
            <i class="fas fa-shopping-bag"></i>
            <h3>Nenhum pedido encontrado</h3>
            <p>Você ainda não fez nenhum pedido.</p>
            <button class="btn-primary" onclick="window.location.href='index.html'">
              <i class="fas fa-shopping-cart"></i> Começar a Comprar
            </button>
          </div>
        `;
        return;
      }

      ordersContainer.innerHTML = `
        <div class="orders-grid">
          ${orders.map(order => this.createOrderCard(order)).join('')}
        </div>
      `;
    });
  }

  // Renderizar pedidos para admin
  renderAllOrders() {
    const ordersContainer = document.querySelector('.admin-orders, .orders-table-container');
    if (!ordersContainer) return;

    this.getAllOrders().then(result => {
      if (!result.success) {
        ordersContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Erro ao carregar pedidos: ${result.error}</p>
          </div>
        `;
        return;
      }

      const orders = result.orders;

      ordersContainer.innerHTML = `
        <div class="orders-table">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => this.createOrderRow(order)).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Adicionar event listeners para botões de ação
      this.addOrderActionListeners();
    });
  }

  // Criar card de pedido para cliente
  createOrderCard(order) {
    const orderDate = new Date(order.createdAt.seconds * 1000).toLocaleDateString('pt-BR');
    const statusClass = this.getStatusClass(order.status);
    const statusText = this.getStatusText(order.status);

    return `
      <div class="order-card">
        <div class="order-header">
          <h3>Pedido #${order.orderNumber}</h3>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="order-info">
          <p><strong>Data:</strong> ${orderDate}</p>
          <p><strong>Total:</strong> R$ ${order.total.toFixed(2)}</p>
          <p><strong>Itens:</strong> ${order.items.length} produto(s)</p>
        </div>
        <div class="order-items">
          ${order.items.slice(0, 3).map(item => `
            <div class="order-item-summary">
              <img src="${item.imagem || 'https://via.placeholder.com/50x50?text=Produto'}" alt="${item.nome}">
              <span>${item.nome} (${item.quantity}x)</span>
            </div>
          `).join('')}
          ${order.items.length > 3 ? `<p class="more-items">+${order.items.length - 3} itens</p>` : ''}
        </div>
        <div class="order-actions">
          <button class="btn-secondary" onclick="orderManager.showOrderDetails('${order.id}')">
            <i class="fas fa-eye"></i> Ver Detalhes
          </button>
        </div>
      </div>
    `;
  }

  // Criar linha de pedido para admin
  createOrderRow(order) {
    const orderDate = new Date(order.createdAt.seconds * 1000).toLocaleDateString('pt-BR');
    const statusClass = this.getStatusClass(order.status);
    const statusText = this.getStatusText(order.status);

    return `
      <tr>
        <td>#${order.orderNumber}</td>
        <td>${order.userEmail}</td>
        <td>${orderDate}</td>
        <td>R$ ${order.total.toFixed(2)}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-small" onclick="orderManager.showOrderDetails('${order.id}')">
              <i class="fas fa-eye"></i>
            </button>
            <select onchange="orderManager.changeOrderStatus('${order.id}', this.value)">
              <option value="">Alterar Status</option>
              <option value="pendente" ${order.status === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="processando" ${order.status === 'processando' ? 'selected' : ''}>Processando</option>
              <option value="enviado" ${order.status === 'enviado' ? 'selected' : ''}>Enviado</option>
              <option value="entregue" ${order.status === 'entregue' ? 'selected' : ''}>Entregue</option>
              <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>
        </td>
      </tr>
    `;
  }

  // Mostrar detalhes do pedido
  showOrderDetails(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      authManager.showError('Pedido não encontrado');
      return;
    }

    const orderDate = new Date(order.createdAt.seconds * 1000).toLocaleString('pt-BR');
    const statusClass = this.getStatusClass(order.status);
    const statusText = this.getStatusText(order.status);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content large">
        <span class="close">&times;</span>
        <h2><i class="fas fa-receipt"></i> Detalhes do Pedido #${order.orderNumber}</h2>
        
        <div class="order-details">
          <div class="order-summary">
            <h3>Informações do Pedido</h3>
            <p><strong>Data:</strong> ${orderDate}</p>
            <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
            <p><strong>Total:</strong> R$ ${order.total.toFixed(2)}</p>
            <p><strong>Método de Pagamento:</strong> ${order.paymentMethod}</p>
          </div>
          
          <div class="customer-info">
            <h3>Informações do Cliente</h3>
            <p><strong>Nome:</strong> ${order.customerInfo.nome}</p>
            <p><strong>Email:</strong> ${order.userEmail}</p>
            <p><strong>Telefone:</strong> ${order.customerInfo.telefone}</p>
          </div>
          
          <div class="delivery-info">
            <h3>Endereço de Entrega</h3>
            <p>${order.deliveryAddress.rua}, ${order.deliveryAddress.numero}</p>
            <p>${order.deliveryAddress.cidade} - ${order.deliveryAddress.cep}</p>
            ${order.deliveryAddress.complemento ? `<p>Complemento: ${order.deliveryAddress.complemento}</p>` : ''}
          </div>
          
          <div class="order-items-detailed">
            <h3>Itens do Pedido</h3>
            <div class="items-list">
              ${order.items.map(item => `
                <div class="item-detail">
                  <img src="${item.imagem || 'https://via.placeholder.com/80x80?text=Produto'}" alt="${item.nome}">
                  <div class="item-info">
                    <h4>${item.nome}</h4>
                    <p>Quantidade: ${item.quantity}</p>
                    <p>Preço unitário: R$ ${item.preco.toFixed(2)}</p>
                    <p><strong>Subtotal: R$ ${(item.preco * item.quantity).toFixed(2)}</strong></p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Fechar modal
    modal.querySelector('.close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Alterar status do pedido
  async changeOrderStatus(orderId, newStatus) {
    if (!newStatus) return;

    const result = await this.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      this.renderAllOrders(); // Atualizar a tabela
    }
  }

  // Adicionar event listeners para ações
  addOrderActionListeners() {
    // Event listeners já são adicionados inline nos métodos create
  }

  // Obter classe CSS do status
  getStatusClass(status) {
    const statusClasses = {
      'pendente': 'status-pendente',
      'processando': 'status-processando',
      'enviado': 'status-enviado',
      'entregue': 'status-entregue',
      'cancelado': 'status-cancelado'
    };
    return statusClasses[status] || 'status-pendente';
  }

  // Obter texto do status
  getStatusText(status) {
    const statusTexts = {
      'pendente': 'Pendente',
      'processando': 'Processando',
      'enviado': 'Enviado',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return statusTexts[status] || 'Pendente';
  }

  // Atualizar interface de pedidos
  updateOrdersUI() {
    // Verificar se estamos na página correta e atualizar
    if (document.querySelector('.user-orders')) {
      this.renderUserOrders();
    }
    if (document.querySelector('.admin-orders')) {
      this.renderAllOrders();
    }
  }
}

// CSS adicional para pedidos
const orderStyles = `
  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
  }

  .order-card {
    background: #fff;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }

  .order-card:hover {
    transform: translateY(-5px);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
  }

  .order-info p {
    margin: 0.5rem 0;
    color: #666;
  }

  .order-items {
    margin: 1rem 0;
  }

  .order-item-summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }

  .order-item-summary img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 5px;
  }

  .order-item-summary span {
    font-size: 0.9rem;
    color: #666;
  }

  .more-items {
    font-style: italic;
    color: #999;
    font-size: 0.9rem;
  }

  .order-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .order-details > div {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 10px;
  }

  .order-details h3 {
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 2px solid #28a745;
    padding-bottom: 0.5rem;
  }

  .order-items-detailed {
    grid-column: 1 / -1;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .item-detail {
    display: flex;
    gap: 1rem;
    background: #fff;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .item-detail img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
  }

  .item-detail .item-info h4 {
    margin-bottom: 0.5rem;
    color: #333;
  }

  .item-detail .item-info p {
    margin: 0.2rem 0;
    color: #666;
  }

  .no-orders {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .no-orders i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn-small {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: #007bff;
    color: white;
  }

  .action-buttons select {
    padding: 0.3rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    .orders-grid {
      grid-template-columns: 1fr;
    }
    
    .order-details {
      grid-template-columns: 1fr;
    }
    
    .item-detail {
      flex-direction: column;
      text-align: center;
    }
  }
`;

// Adicionar estilos
const styleElement = document.createElement('style');
styleElement.textContent = orderStyles;
document.head.appendChild(styleElement);

// Criar instância global
window.orderManager = new OrderManager();

export { OrderManager };
export default window.orderManager;
