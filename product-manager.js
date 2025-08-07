// Product Manager - Gerenciamento de Produtos com Firebase
import { firebaseService } from './firebase-config.js';
import authManager from './auth-manager.js';

class ProductManager {
  constructor() {
    this.products = [];
    this.categories = ['eletrônicos', 'roupas', 'casa', 'livros', 'esportes', 'beleza'];
    this.currentFilter = { category: '', search: '', minPrice: 0, maxPrice: 10000 };
    this.cart = this.loadCart();
    this.initializeProducts();
  }

  // Inicializar produtos do Firebase
  async initializeProducts() {
    try {
      const result = await firebaseService.getProducts();
      if (result.success) {
        this.products = result.products;
        this.renderProducts();
        this.updateProductCount();
      } else {
        console.error('Erro ao carregar produtos:', result.error);
        // Fallback para produtos de exemplo se necessário
        this.loadSampleProducts();
      }
    } catch (error) {
      console.error('Erro na inicialização de produtos:', error);
      this.loadSampleProducts();
    }

    // Listener para atualizações em tempo real
    firebaseService.onProductsChange((snapshot) => {
      this.products = [];
      snapshot.forEach((doc) => {
        this.products.push({ id: doc.id, ...doc.data() });
      });
      this.renderProducts();
      this.updateProductCount();
    });
  }

  // Carregar produtos de exemplo (fallback)
  loadSampleProducts() {
    this.products = [
      {
        id: 'sample1',
        nome: 'Smartphone Premium',
        categoria: 'eletrônicos',
        preco: 1299.99,
        estoque: 15,
        descricao: 'Smartphone com tela AMOLED, 128GB, câmera tripla',
        imagem: 'https://via.placeholder.com/300x200?text=Smartphone'
      },
      {
        id: 'sample2',
        nome: 'Camiseta Básica',
        categoria: 'roupas',
        preco: 49.99,
        estoque: 30,
        descricao: 'Camiseta 100% algodão, várias cores disponíveis',
        imagem: 'https://via.placeholder.com/300x200?text=Camiseta'
      },
      {
        id: 'sample3',
        nome: 'Mesa de Centro',
        categoria: 'casa',
        preco: 299.99,
        estoque: 8,
        descricao: 'Mesa de centro em madeira maciça, design moderno',
        imagem: 'https://via.placeholder.com/300x200?text=Mesa'
      }
    ];
    this.renderProducts();
    this.updateProductCount();
  }

  // Adicionar produto (admin)
  async addProduct(productData) {
    if (!authManager.requireAdmin()) return;

    try {
      const result = await firebaseService.addProduct(productData);
      if (result.success) {
        authManager.showSuccess('Produto adicionado com sucesso!');
        return { success: true, id: result.id };
      } else {
        authManager.showError('Erro ao adicionar produto: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      authManager.showError('Erro inesperado ao adicionar produto');
      return { success: false, error: error.message };
    }
  }

  // Atualizar produto (admin)
  async updateProduct(productId, productData) {
    if (!authManager.requireAdmin()) return;

    try {
      const result = await firebaseService.updateProduct(productId, productData);
      if (result.success) {
        authManager.showSuccess('Produto atualizado com sucesso!');
        return { success: true };
      } else {
        authManager.showError('Erro ao atualizar produto: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      authManager.showError('Erro inesperado ao atualizar produto');
      return { success: false, error: error.message };
    }
  }

  // Remover produto (admin)
  async deleteProduct(productId) {
    if (!authManager.requireAdmin()) return;

    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const result = await firebaseService.deleteProduct(productId);
      if (result.success) {
        authManager.showSuccess('Produto removido com sucesso!');
        return { success: true };
      } else {
        authManager.showError('Erro ao remover produto: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      authManager.showError('Erro inesperado ao remover produto');
      return { success: false, error: error.message };
    }
  }

  // Filtrar produtos
  filterProducts(filters = {}) {
    this.currentFilter = { ...this.currentFilter, ...filters };
    this.renderProducts();
  }

  // Obter produtos filtrados
  getFilteredProducts() {
    return this.products.filter(product => {
      const matchCategory = !this.currentFilter.category || 
                           product.categoria === this.currentFilter.category;
      
      const matchSearch = !this.currentFilter.search ||
                         product.nome.toLowerCase().includes(this.currentFilter.search.toLowerCase()) ||
                         product.descricao.toLowerCase().includes(this.currentFilter.search.toLowerCase());
      
      const matchPrice = product.preco >= this.currentFilter.minPrice &&
                        product.preco <= this.currentFilter.maxPrice;
      
      return matchCategory && matchSearch && matchPrice;
    });
  }

  // Renderizar produtos na interface
  renderProducts() {
    const productGrid = document.querySelector('.featured-products, .products-grid, .grid-produtos');
    if (!productGrid) return;

    const filteredProducts = this.getFilteredProducts();

    if (filteredProducts.length === 0) {
      productGrid.innerHTML = `
        <div class="no-products">
          <i class="fas fa-box-open"></i>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar os filtros ou buscar por outros termos.</p>
        </div>
      `;
      return;
    }

    productGrid.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
    
    // Adicionar event listeners
    this.addProductEventListeners();
  }

  // Criar card de produto
  createProductCard(product) {
    const stockStatus = product.estoque > 10 ? 'Em estoque' : 
                       product.estoque > 0 ? `Últimas ${product.estoque} unidades` : 'Fora de estoque';
    
    const stockClass = product.estoque > 10 ? '' : product.estoque > 0 ? 'low-stock' : 'out-of-stock';

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${product.imagem || 'https://via.placeholder.com/300x200?text=Produto'}" 
               alt="${product.nome}" 
               onerror="this.src='https://via.placeholder.com/300x200?text=Produto'">
          <div class="stock-badge ${stockClass}">${stockStatus}</div>
        </div>
        <div class="product-info">
          <h3>${product.nome}</h3>
          <p class="product-description">${product.descricao}</p>
          <div class="product-price">R$ ${product.preco.toFixed(2)}</div>
          <div class="product-stock">Em estoque: ${product.estoque} unidades</div>
          <div class="product-actions">
            <button class="btn-primary add-to-cart" 
                    data-product-id="${product.id}"
                    ${product.estoque === 0 ? 'disabled' : ''}>
              <i class="fas fa-shopping-cart"></i>
              ${product.estoque === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
            </button>
            <button class="btn-secondary view-details" data-product-id="${product.id}">
              <i class="fas fa-eye"></i> Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Adicionar event listeners aos produtos
  addProductEventListeners() {
    // Botões de adicionar ao carrinho
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        this.addToCart(productId);
      });
    });

    // Botões de ver detalhes
    document.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        this.showProductDetails(productId);
      });
    });
  }

  // Adicionar produto ao carrinho
  addToCart(productId, quantity = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      authManager.showError('Produto não encontrado');
      return;
    }

    if (product.estoque === 0) {
      authManager.showError('Produto fora de estoque');
      return;
    }

    // Verificar se já existe no carrinho
    const existingItem = this.cart.find(item => item.id === productId);
    
    if (existingItem) {
      if (existingItem.quantity + quantity > product.estoque) {
        authManager.showError('Quantidade indisponível em estoque');
        return;
      }
      existingItem.quantity += quantity;
    } else {
      if (quantity > product.estoque) {
        authManager.showError('Quantidade indisponível em estoque');
        return;
      }
      this.cart.push({
        id: productId,
        nome: product.nome,
        preco: product.preco,
        imagem: product.imagem,
        quantity: quantity
      });
    }

    this.saveCart();
    this.updateCartUI();
    authManager.showSuccess(`${product.nome} adicionado ao carrinho!`);
  }

  // Mostrar detalhes do produto
  showProductDetails(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Implementar modal de detalhes
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content large">
        <span class="close">&times;</span>
        <div class="product-details-content">
          <div class="product-details-image">
            <img src="${product.imagem || 'https://via.placeholder.com/400x300?text=Produto'}" alt="${product.nome}">
          </div>
          <div class="product-details-info">
            <h2>${product.nome}</h2>
            <div class="product-category">Categoria: ${product.categoria}</div>
            <div class="product-price-large">R$ ${product.preco.toFixed(2)}</div>
            <div class="product-description-full">${product.descricao}</div>
            <div class="stock-status ${product.estoque > 10 ? '' : product.estoque > 0 ? 'low-stock' : 'out-of-stock'}">
              ${product.estoque > 0 ? `${product.estoque} unidades disponíveis` : 'Fora de estoque'}
            </div>
            <div class="product-actions">
              <button class="btn-primary large" onclick="productManager.addToCart('${product.id}')" ${product.estoque === 0 ? 'disabled' : ''}>
                <i class="fas fa-shopping-cart"></i>
                ${product.estoque === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
              </button>
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

  // Gerenciamento do carrinho
  loadCart() {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
      cartCount.textContent = totalItems;
      if (totalItems > 0) {
        cartCount.style.display = 'inline';
      } else {
        cartCount.style.display = 'none';
      }
    }
  }

  updateProductCount() {
    const productCount = document.querySelector('.product-count');
    if (productCount) {
      productCount.textContent = `${this.products.length} produtos encontrados`;
    }
  }

  // Obter dados do carrinho
  getCart() {
    return this.cart;
  }

  // Limpar carrinho
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartUI();
  }
}

// CSS adicional para produtos
const productStyles = `
  .no-products {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .no-products i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .product-actions {
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
  }

  .product-actions button {
    flex: 1;
    white-space: nowrap;
  }

  .stock-badge.out-of-stock {
    background: linear-gradient(135deg, #dc3545, #c82333);
  }

  .stock-badge.low-stock {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    color: #000;
  }

  .product-count {
    color: #666;
    font-style: italic;
    margin-bottom: 1rem;
  }
`;

// Adicionar estilos
const styleElement = document.createElement('style');
styleElement.textContent = productStyles;
document.head.appendChild(styleElement);

// Criar instância global
window.productManager = new ProductManager();

export { ProductManager };
export default window.productManager;
