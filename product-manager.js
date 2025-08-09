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
      // Mostrar loading
      this.showLoading();
      
      const result = await firebaseService.getProducts();
      if (result.success && result.products.length > 0) {
        this.products = result.products;
      } else {
        console.log('Nenhum produto encontrado no Firebase, carregando produtos de exemplo...');
        this.loadSampleProducts();
      }
      
      // Renderizar produtos
      this.renderProducts();
      this.loadCategories();
      this.updateProductCount();
      
      // Configurar listener para atualizações em tempo real
      this.setupRealtimeListener();
      
    } catch (error) {
      console.error('Erro na inicialização de produtos:', error);
      this.loadSampleProducts();
      this.renderProducts();
      this.loadCategories();
    } finally {
      this.hideLoading();
    }
  }

  // Configurar listener para atualizações em tempo real
  setupRealtimeListener() {
    try {
      firebaseService.onProductsChange((snapshot) => {
        this.products = [];
        snapshot.forEach((doc) => {
          this.products.push({ id: doc.id, ...doc.data() });
        });
        this.renderProducts();
        this.updateProductCount();
        console.log('Produtos atualizados em tempo real');
      });
    } catch (error) {
      console.error('Erro ao configurar listener de produtos:', error);
    }
  }

  // Mostrar loading
  showLoading() {
    const container = document.getElementById('products-container') || document.querySelector('.grid-produtos');
    if (container) {
      container.innerHTML = `
        <div class="loading-products">
          <div class="loading-spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      `;
    }
  }

  // Esconder loading
  hideLoading() {
    const loadingElement = document.querySelector('.loading-products');
    if (loadingElement) {
      loadingElement.remove();
    }
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
    const productContainers = document.querySelectorAll('.featured-products, .products-grid, .grid-produtos');
    if (productContainers.length === 0) return;

    const filteredProducts = this.getFilteredProducts();

    productContainers.forEach(container => {
      if (filteredProducts.length === 0) {
        container.innerHTML = `
          <div class="no-products">
            <i class="fas fa-box-open"></i>
            <h3>Nenhum produto encontrado</h3>
            <p>Tente ajustar os filtros ou buscar por outros termos.</p>
            <button onclick="productManager.clearFilters()" class="btn-secondary">
              <i class="fas fa-filter"></i> Limpar Filtros
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
    });
    
    // Adicionar event listeners para todos os produtos
    this.addProductEventListeners();
    
    // Atualizar contador de produtos
    this.updateProductCount();
  }

  // Criar card de produto otimizado
  createProductCard(product) {
    const stockStatus = this.getStockStatus(product.estoque);
    const stockClass = this.getStockClass(product.estoque);
    const isOutOfStock = product.estoque === 0;

    return `
      <div class="product-card ${stockClass}" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${product.imagem || 'https://via.placeholder.com/300x200?text=Produto'}" 
               alt="${product.nome}" 
               loading="lazy"
               onerror="this.src='https://via.placeholder.com/300x200?text=Produto'">
          
          ${product.promocao ? `<div class="product-badge sale">-${product.desconto}%</div>` : ''}
          ${product.novo ? `<div class="product-badge new">Novo</div>` : ''}
          
          <div class="product-overlay">
            <button class="btn-quick-view" data-product-id="${product.id}" title="Visualização rápida">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-wishlist" data-product-id="${product.id}" title="Adicionar aos favoritos">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-category">${product.categoria}</div>
          <h3 class="product-name">${product.nome}</h3>
          <p class="product-description">${product.descricao || 'Produto de qualidade premium'}</p>
          
          <div class="product-rating">
            <div class="stars">
              ${this.generateStars(product.rating || 4.5)}
            </div>
            <span class="rating-count">(${product.reviews || 0} avaliações)</span>
          </div>
          
          <div class="product-pricing">
            ${product.promocao ? 
              `<span class="price-original">R$ ${product.precoOriginal?.toFixed(2) || (product.preco * 1.2).toFixed(2)}</span>` : 
              ''
            }
            <span class="product-price ${product.promocao ? 'price-sale' : ''}">
              R$ ${product.preco.toFixed(2)}
            </span>
          </div>
          
          <div class="stock-info ${stockClass}">
            <i class="fas ${isOutOfStock ? 'fa-times-circle' : 'fa-check-circle'}"></i>
            ${stockStatus}
          </div>
          
          <div class="product-actions">
            <button class="btn-add-cart" 
                    data-product-id="${product.id}"
                    ${isOutOfStock ? 'disabled' : ''}
                    title="${isOutOfStock ? 'Produto indisponível' : 'Adicionar ao carrinho'}">
              <i class="fas ${isOutOfStock ? 'fa-times' : 'fa-shopping-cart'}"></i>
              ${isOutOfStock ? 'Indisponível' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Obter status do estoque
  getStockStatus(estoque) {
    if (estoque === 0) return 'Fora de estoque';
    if (estoque <= 5) return `Últimas ${estoque} unidades`;
    if (estoque <= 10) return 'Estoque baixo';
    return 'Em estoque';
  }

  // Obter classe CSS do estoque
  getStockClass(estoque) {
    if (estoque === 0) return 'out-of-stock';
    if (estoque <= 5) return 'critical-stock';
    if (estoque <= 10) return 'low-stock';
    return 'in-stock';
  }

  // Gerar estrelas de avaliação
  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Estrela meio cheia
    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Estrelas vazias
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
  }

  // Limpar filtros
  clearFilters() {
    this.currentFilter = { category: '', search: '', minPrice: 0, maxPrice: 10000 };
    
    // Limpar campos de filtro na interface
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input') || document.getElementById('header-search');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    
    if (categoryFilter) categoryFilter.value = '';
    if (searchInput) searchInput.value = '';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    
    this.renderProducts();
    
    // Notificar usuário
    if (window.authManager) {
      authManager.showSuccess('Filtros limpos com sucesso!');
    }
  }

  // Atualizar contador de produtos
  updateProductCount() {
    const productCount = document.querySelector('.product-count');
    if (productCount) {
      const filteredProducts = this.getFilteredProducts();
      productCount.textContent = `${filteredProducts.length} produtos encontrados`;
    }
  }

  // Adicionar event listeners aos produtos
  addProductEventListeners() {
    // Botões de adicionar ao carrinho
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('button').dataset.productId;
        this.addToCart(productId);
      });
    });

    // Botões de visualização rápida
    document.querySelectorAll('.btn-quick-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('button').dataset.productId;
        this.showProductDetails(productId);
      });
    });

    // Botões de favoritos
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('button').dataset.productId;
        this.toggleWishlist(productId);
      });
    });
  }

  // Adicionar produto ao carrinho
  addToCart(productId, quantity = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      if (window.authManager) {
        authManager.showError('Produto não encontrado');
      }
      return;
    }

    if (product.estoque === 0) {
      if (window.authManager) {
        authManager.showError('Produto fora de estoque');
      }
      return;
    }

    // Verificar se já existe no carrinho
    const existingItem = this.cart.find(item => item.id === productId);
    
    if (existingItem) {
      if (existingItem.quantity + quantity > product.estoque) {
        if (window.authManager) {
          authManager.showError('Quantidade indisponível em estoque');
        }
        return;
      }
      existingItem.quantity += quantity;
    } else {
      if (quantity > product.estoque) {
        if (window.authManager) {
          authManager.showError('Quantidade indisponível em estoque');
        }
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
    
    if (window.authManager) {
      authManager.showSuccess(`${product.nome} adicionado ao carrinho!`);
    }
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
      cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }

    // Atualizar badge do carrinho
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? 'inline' : 'none';
    }
  }

  // Adicionar/remover dos favoritos
  toggleWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
      wishlist.splice(index, 1);
      if (window.authManager) {
        authManager.showSuccess('Produto removido dos favoritos');
      }
    } else {
      wishlist.push(productId);
      if (window.authManager) {
        authManager.showSuccess('Produto adicionado aos favoritos');
      }
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    this.updateWishlistUI();
  }

  // Atualizar interface dos favoritos
  updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
      const productId = btn.dataset.productId;
      const icon = btn.querySelector('i');
      
      if (wishlist.includes(productId)) {
        icon.className = 'fas fa-heart';
        btn.classList.add('active');
      } else {
        icon.className = 'far fa-heart';
        btn.classList.remove('active');
      }
    });
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

// Inicializar Product Manager
const productManager = new ProductManager();
export default window.productManager;
