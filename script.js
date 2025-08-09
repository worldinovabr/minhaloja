// Dados dos produtos expandidos
const produtos = [
  { 
    id: 1, 
    nome: 'Camisa Polo Masculina', 
    preco: 89.99, 
    categoria: 'roupas',
    imagem: 'https://via.placeholder.com/300x300?text=Camisa+Polo',
    descricao: 'Camisa polo masculina de alta qualidade, 100% algodão.',
    estoque: 15,
    rating: 4.5,
    promocao: true,
    desconto: 20
  },
  { 
    id: 2, 
    nome: 'Vestido Floral Feminino', 
    preco: 149.99, 
    categoria: 'roupas',
    imagem: 'https://via.placeholder.com/300x300?text=Vestido+Floral',
    descricao: 'Vestido floral elegante, perfeito para ocasiões especiais.',
    estoque: 8,
    rating: 4.8,
    promocao: false
  },
  { 
    id: 3, 
    nome: 'Calça Jeans Premium', 
    preco: 119.99, 
    categoria: 'roupas',
    imagem: 'https://via.placeholder.com/300x300?text=Calça+Jeans',
    descricao: 'Calça jeans premium com corte moderno e confortável.',
    estoque: 12,
    rating: 4.3,
    promocao: true,
    desconto: 15
  },
  { 
    id: 4, 
    nome: 'Tênis Esportivo', 
    preco: 199.99, 
    categoria: 'calcados',
    imagem: 'https://via.placeholder.com/300x300?text=Tênis+Esportivo',
    descricao: 'Tênis esportivo confortável para atividades físicas.',
    estoque: 20,
    rating: 4.7,
    promocao: false
  },
  { 
    id: 5, 
    nome: 'Relógio Digital', 
    preco: 79.99, 
    categoria: 'acessorios',
    imagem: 'https://via.placeholder.com/300x300?text=Relógio+Digital',
    descricao: 'Relógio digital moderno com múltiplas funções.',
    estoque: 25,
    rating: 4.2,
    promocao: true,
    desconto: 10
  },
  { 
    id: 6, 
    nome: 'Bolsa Feminina', 
    preco: 89.99, 
    categoria: 'acessorios',
    imagem: 'https://via.placeholder.com/300x300?text=Bolsa+Feminina',
    descricao: 'Bolsa feminina elegante para o dia a dia.',
    estoque: 10,
    rating: 4.6,
    promocao: false
  }
];

// Carrinho de compras
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let currentFilter = { category: '', maxPrice: 500, search: '' };
let registerType = 'client';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('ano').textContent = new Date().getFullYear();
  renderizarProdutos();
  renderizarProdutosDestaque();
  atualizarCarrinho();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Filtro de preço
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter) {
    priceFilter.addEventListener('input', function() {
      document.getElementById('price-value').textContent = this.value;
    });
  }

  // Navegação
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Fechar modais clicando fora
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      closeAllModals();
    }
  });
}

// Renderização de produtos
function renderizarProdutos() {
  const lista = document.getElementById('product-list');
  if (!lista) return;
  
  const produtosFiltrados = filtrarProdutos();
  lista.innerHTML = '';
  
  if (produtosFiltrados.length === 0) {
    lista.innerHTML = `
      <div class="no-products">
        <i class="fas fa-search"></i>
        <h3>Nenhum produto encontrado</h3>
        <p>Tente ajustar os filtros de busca</p>
      </div>
    `;
    return;
  }
  
  produtosFiltrados.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const precoFinal = produto.promocao ? 
      produto.preco * (1 - produto.desconto / 100) : 
      produto.preco;
    
    card.innerHTML = `
      <div class="product-image">
        <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy" />
        ${produto.promocao ? `<div class="discount-badge">-${produto.desconto}%</div>` : ''}
        <div class="product-overlay">
          <button onclick="viewProduct(${produto.id})" class="btn-view">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="toggleWishlist(${produto.id})" class="btn-wishlist">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <h3>${produto.nome}</h3>
        <p class="product-description">${produto.descricao}</p>
        <div class="product-rating">
          ${generateStars(produto.rating)}
          <span>(${produto.rating})</span>
        </div>
        <div class="product-pricing">
          ${produto.promocao ? `<span class="price-original">R$ ${produto.preco.toFixed(2)}</span>` : ''}
          <span class="product-price ${produto.promocao ? 'price-sale' : ''}">
            R$ ${precoFinal.toFixed(2)}
          </span>
        </div>
        <div class="stock-info ${getStockClass(produto.estoque)}">
          <i class="fas ${produto.estoque > 0 ? 'fa-check-circle' : 'fa-times-circle'}"></i>
          ${getStockText(produto.estoque)}
        </div>
        <button onclick="adicionarAoCarrinho(${produto.id})" 
                class="btn-add-cart ${produto.estoque === 0 ? 'disabled' : ''}"
                ${produto.estoque === 0 ? 'disabled' : ''}>
          <i class="fas fa-shopping-cart"></i>
          ${produto.estoque === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    `;
    lista.appendChild(card);
  });
  
  updateProductCount(produtosFiltrados.length);
}

// Renderizar produtos em destaque na home
function renderizarProdutosDestaque() {
  const container = document.getElementById('featured-products');
  if (!container) return;
  
  const produtosDestaque = produtos.filter(p => p.promocao).slice(0, 3);
  
  container.innerHTML = produtosDestaque.map(produto => {
    const precoFinal = produto.preco * (1 - produto.desconto / 100);
    return `
      <div class="featured-product">
        <img src="${produto.imagem}" alt="${produto.nome}" />
        <h4>${produto.nome}</h4>
        <div class="featured-price">
          <span class="price-original">R$ ${produto.preco.toFixed(2)}</span>
          <span class="price-sale">R$ ${precoFinal.toFixed(2)}</span>
        </div>
        <button onclick="adicionarAoCarrinho(${produto.id})" class="btn-featured">
          Comprar Agora
        </button>
      </div>
    `;
  }).join('');
}

// Funções de filtro
function filtrarProdutos() {
  return produtos.filter(produto => {
    const matchCategory = !currentFilter.category || produto.categoria === currentFilter.category;
    const matchPrice = produto.preco <= currentFilter.maxPrice;
    const matchSearch = !currentFilter.search || 
      produto.nome.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(currentFilter.search.toLowerCase());
    
    return matchCategory && matchPrice && matchSearch;
  });
}

function filterProducts() {
  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');
  
  currentFilter.category = categoryFilter?.value || '';
  currentFilter.maxPrice = priceFilter?.value || 500;
  
  renderizarProdutos();
}

function searchProducts() {
  const searchInput = document.getElementById('search-input');
  currentFilter.search = searchInput?.value || '';
  renderizarProdutos();
  showSection('produtos');
}

function handleSearchKeypress(event) {
  if (event.key === 'Enter') {
    searchProducts();
  }
}

// Funções do carrinho
function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto || produto.estoque === 0) {
    showNotification('Produto indisponível', 'error');
    return;
  }
  
  const itemExistente = carrinho.find(item => item.id === id);
  
  if (itemExistente) {
    if (itemExistente.quantity >= produto.estoque) {
      showNotification('Estoque insuficiente', 'error');
      return;
    }
    itemExistente.quantity += 1;
  } else {
    const precoFinal = produto.promocao ? 
      produto.preco * (1 - produto.desconto / 100) : 
      produto.preco;
    
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: precoFinal,
      imagem: produto.imagem,
      quantity: 1,
      estoque: produto.estoque
    });
  }
  
  salvarCarrinho();
  atualizarCarrinho();
  showNotification(`${produto.nome} adicionado ao carrinho!`, 'success');
}

function atualizarCarrinho() {
  const cartCount = document.getElementById('cart-count');
  const totalItems = carrinho.reduce((sum, item) => sum + item.quantity, 0);
  
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Modal do carrinho
function showCartModal() {
  const modal = document.getElementById('cart-modal');
  const cartItemsContainer = document.getElementById('cart-items-modal');
  const cartTotalElement = document.getElementById('cart-total-modal');
  
  cartItemsContainer.innerHTML = '';
  
  if (carrinho.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Seu carrinho está vazio</h3>
        <p>Adicione alguns produtos incríveis!</p>
        <button onclick="closeCartModal(); showSection('produtos')" class="btn-primary">
          <i class="fas fa-shopping-bag"></i> Ver Produtos
        </button>
      </div>
    `;
    cartTotalElement.textContent = '0.00';
  } else {
    carrinho.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item-modal';
      cartItem.innerHTML = `
        <img src="${item.imagem}" alt="${item.nome}">
        <div class="item-info">
          <h4>${item.nome}</h4>
          <p class="item-price">R$ ${item.preco.toFixed(2)} cada</p>
        </div>
        <div class="quantity-controls">
          <button class="qty-btn minus" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity">${item.quantity}</span>
          <button class="qty-btn plus" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="item-total">
          <span>R$ ${(item.preco * item.quantity).toFixed(2)}</span>
        </div>
        <button class="remove-item" onclick="removeFromCart(${item.id})" title="Remover item">
          <i class="fas fa-trash"></i>
        </button>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
    
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
  }
  
  modal.style.display = 'block';
  setTimeout(() => modal.classList.add('show'), 10);
}

function closeCartModal() {
  const modal = document.getElementById('cart-modal');
  modal.classList.remove('show');
  setTimeout(() => modal.style.display = 'none', 300);
}

function updateQuantity(id, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(id);
    return;
  }
  
  const item = carrinho.find(i => i.id === id);
  if (item && newQuantity <= item.estoque) {
    item.quantity = newQuantity;
    salvarCarrinho();
    atualizarCarrinho();
    showCartModal();
  } else {
    showNotification('Quantidade não disponível em estoque', 'error');
  }
}

function removeFromCart(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  salvarCarrinho();
  atualizarCarrinho();
  showCartModal();
  showNotification('Item removido do carrinho', 'info');
}

function clearCart() {
  carrinho = [];
  salvarCarrinho();
  atualizarCarrinho();
  closeCartModal();
  showNotification('Carrinho limpo com sucesso!', 'success');
}

// Finalização de compra
function proceedToCheckout() {
  if (carrinho.length === 0) {
    showNotification('Seu carrinho está vazio', 'error');
    return;
  }
  
  const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
  const itemCount = carrinho.reduce((sum, item) => sum + item.quantity, 0);
  
  const confirmMessage = `
    Finalizar compra?
    
    ${itemCount} item(s)
    Total: R$ ${total.toFixed(2)}
    
    Você será redirecionado para o pagamento.
  `;
  
  if (confirm(confirmMessage)) {
    // Simular processamento
    showNotification('Processando pedido...', 'info');
    setTimeout(() => {
      carrinho = [];
      salvarCarrinho();
      atualizarCarrinho();
      closeCartModal();
      showNotification('Pedido realizado com sucesso! Obrigado pela compra!', 'success');
    }, 2000);
  }
}

// Sistema de navegação
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Atualizar navegação ativa
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${sectionId}`) {
      link.classList.add('active');
    }
  });
}

// Sistema de cadastro
function openRegisterModal() {
  document.getElementById('register-options-modal').style.display = 'block';
}

function closeRegisterModal() {
  document.getElementById('register-options-modal').style.display = 'none';
  document.getElementById('register-modal').style.display = 'none';
}

function openClientRegister() {
  closeRegisterModal();
  document.getElementById('register-title').textContent = 'Cadastro de Cliente';
  document.getElementById('admin-fields').style.display = 'none';
  document.getElementById('register-modal').style.display = 'block';
  registerType = 'client';
}

function openAdminRegister() {
  closeRegisterModal();
  document.getElementById('register-title').textContent = 'Cadastro de Administrador';
  document.getElementById('admin-fields').style.display = 'block';
  document.getElementById('register-modal').style.display = 'block';
  registerType = 'admin';
}

function handleRegister(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    phone: formData.get('phone'),
    adminCode: formData.get('adminCode')
  };
  
  // Validações
  if (data.password !== data.confirmPassword) {
    showNotification('As senhas não coincidem', 'error');
    return;
  }
  
  if (data.password.length < 6) {
    showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
    return;
  }
  
  if (registerType === 'admin' && data.adminCode !== 'ADMIN2024') {
    showNotification('Código de administrador inválido', 'error');
    return;
  }
  
  // Simular cadastro
  showNotification('Cadastrando usuário...', 'info');
  setTimeout(() => {
    closeRegisterModal();
    showNotification(`Cadastro realizado com sucesso! Bem-vindo, ${data.name}!`, 'success');
    document.getElementById('user-name').textContent = data.name;
    
    // Esconder botões de auth e mostrar nome do usuário
    document.querySelector('.auth-buttons').style.display = 'none';
    document.querySelector('.user-info').style.display = 'flex';
  }, 1500);
}

// Visualização de produto
function viewProduct(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  
  const modal = document.getElementById('product-modal');
  const details = document.getElementById('product-details');
  
  const precoFinal = produto.promocao ? 
    produto.preco * (1 - produto.desconto / 100) : 
    produto.preco;
  
  details.innerHTML = `
    <div class="product-details-content">
      <div class="product-details-image">
        <img src="${produto.imagem}" alt="${produto.nome}">
      </div>
      <div class="product-details-info">
        <h2>${produto.nome}</h2>
        <div class="product-rating">
          ${generateStars(produto.rating)}
          <span>(${produto.rating}) - ${produto.estoque} em estoque</span>
        </div>
        <div class="product-pricing">
          ${produto.promocao ? `<span class="price-original">R$ ${produto.preco.toFixed(2)}</span>` : ''}
          <span class="product-price ${produto.promocao ? 'price-sale' : ''}">
            R$ ${precoFinal.toFixed(2)}
          </span>
        </div>
        <p class="product-description-full">${produto.descricao}</p>
        <div class="product-actions">
          <button onclick="adicionarAoCarrinho(${produto.id}); closeProductModal()" 
                  class="btn-primary large ${produto.estoque === 0 ? 'disabled' : ''}"
                  ${produto.estoque === 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i>
            ${produto.estoque === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  modal.style.display = 'block';
}

function closeProductModal() {
  document.getElementById('product-modal').style.display = 'none';
}

// Formulário de contato
function submitContactForm(event) {
  event.preventDefault();
  showNotification('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
  event.target.reset();
}

// Funções auxiliares
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  
  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

function getStockClass(estoque) {
  if (estoque === 0) return 'out-of-stock';
  if (estoque <= 5) return 'low-stock';
  return 'in-stock';
}

function getStockText(estoque) {
  if (estoque === 0) return 'Fora de estoque';
  if (estoque <= 5) return `Últimas ${estoque} unidades`;
  return 'Em estoque';
}

function updateProductCount(count) {
  const counter = document.getElementById('products-count');
  if (counter) {
    counter.textContent = `${count} produto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
    modal.classList.remove('show');
  });
}

// Sistema de notificações
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${getNotificationIcon(type)}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function getNotificationIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };
  return icons[type] || icons.info;
}

// Lista de desejos (básica)
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function toggleWishlist(id) {
  const index = wishlist.indexOf(id);
  if (index > -1) {
    wishlist.splice(index, 1);
    showNotification('Removido dos favoritos', 'info');
  } else {
    wishlist.push(id);
    showNotification('Adicionado aos favoritos', 'success');
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    const productId = parseInt(btn.getAttribute('onclick').match(/\d+/)[0]);
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