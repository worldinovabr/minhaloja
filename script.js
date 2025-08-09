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
  setupIntersectionObserver();
  setupServiceWorker();
  addSkipLink();
});

// Adicionar link de acessibilidade
function addSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Pular para o conteúdo principal';
  document.body.insertBefore(skipLink, document.body.firstChild);
}

// Intersection Observer para animações suaves
function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observar elementos que devem animar
  const animatedElements = document.querySelectorAll('.product-card, .feature-card, .hero');
  animatedElements.forEach(el => observer.observe(el));
}

// Service Worker para cache (PWA básico)
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.log('SW registration failed'));
    });
  }
}

// Função para toggle do menu mobile com melhor acessibilidade
function toggleMobileMenu() {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.mobile-menu-toggle');
  
  if (navbar && toggle) {
    const isOpen = navbar.classList.contains('mobile-open');
    
    navbar.classList.toggle('mobile-open');
    toggle.classList.toggle('active');
    
    // Acessibilidade
    toggle.setAttribute('aria-expanded', !isOpen);
    navbar.setAttribute('aria-hidden', isOpen);
    
    // Focar no primeiro link quando abrir
    if (!isOpen) {
      const firstLink = navbar.querySelector('.nav-link');
      setTimeout(() => firstLink?.focus(), 300);
    }
    
    // Prevenir scroll do body quando menu estiver aberto
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  }
}

// Melhorar função de busca com debounce
let searchTimeout;
function searchProducts() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const searchInput = document.getElementById('search-input');
    currentFilter.search = searchInput?.value || '';
    renderizarProdutos();
    showSection('produtos');
    
    // Analytics fictício
    if (currentFilter.search) {
      console.log('Busca realizada:', currentFilter.search);
    }
  }, 300);
}

// Função melhorada para adicionar ao carrinho com feedback visual
function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  const button = event.target.closest('.btn-add-cart');
  
  if (!produto || produto.estoque === 0) {
    showNotification('Produto indisponível', 'error');
    return;
  }
  
  // Feedback visual no botão
  if (button) {
    button.classList.add('btn-loading');
    button.innerHTML = '<span class="loading"></span>Adicionando...';
  }
  
  setTimeout(() => {
    const itemExistente = carrinho.find(item => item.id === id);
    
    if (itemExistente) {
      if (itemExistente.quantity >= produto.estoque) {
        showNotification('Estoque insuficiente', 'error');
        resetButton(button, id);
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
    
    // Animação no ícone do carrinho
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('bounce-in');
      setTimeout(() => cartIcon.classList.remove('bounce-in'), 600);
    }
    
    resetButton(button, id);
  }, 800);
}

function resetButton(button, productId) {
  if (button) {
    button.classList.remove('btn-loading');
    button.innerHTML = `
      <i class="fas fa-shopping-cart"></i>
      Adicionar ao Carrinho
    `;
  }
}

// Melhorar sistema de navegação com história
function showSection(sectionId) {
  // Atualizar URL sem recarregar página
  history.pushState({section: sectionId}, '', `#${sectionId}`);
  
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.classList.add('slide-up');
    
    // Scroll suave para o topo da seção
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  // Atualizar navegação ativa
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${sectionId}`) {
      link.classList.add('active');
    }
  });
  
  // Fechar menu mobile se estiver aberto
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.mobile-menu-toggle');
  if (navbar?.classList.contains('mobile-open')) {
    navbar.classList.remove('mobile-open');
    toggle?.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Navegação por histórico do browser
window.addEventListener('popstate', (event) => {
  const section = event.state?.section || 'home';
  showSection(section);
});

// Validação de formulário melhorada
function validateForm(formData, formType = 'contact') {
  const errors = [];
  
  if (formType === 'contact') {
    if (!formData.get('name')?.trim()) {
      errors.push({field: 'name', message: 'Nome é obrigatório'});
    }
    
    if (!formData.get('email')?.trim()) {
      errors.push({field: 'email', message: 'Email é obrigatório'});
    } else if (!/\S+@\S+\.\S+/.test(formData.get('email'))) {
      errors.push({field: 'email', message: 'Email inválido'});
    }
    
    if (!formData.get('message')?.trim()) {
      errors.push({field: 'message', message: 'Mensagem é obrigatória'});
    }
  }
  
  return errors;
}

// Função melhorada para formulário de contato
function submitContactForm(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const errors = validateForm(formData, 'contact');
  
  // Limpar erros anteriores
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.error-message').forEach(el => el.remove());
  
  if (errors.length > 0) {
    errors.forEach(error => {
      const field = form.querySelector(`[name="${error.field}"]`);
      if (field) {
        field.classList.add('error');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
        field.parentNode.appendChild(errorMsg);
      }
    });
    showNotification('Por favor, corrija os erros no formulário', 'error');
    return;
  }
  
  // Simular envio
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.classList.add('btn-loading');
  submitBtn.innerHTML = '<span class="loading"></span>Enviando...';
  
  setTimeout(() => {
    showNotification('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
    form.reset();
    submitBtn.classList.remove('btn-loading');
    submitBtn.innerHTML = 'Enviar Mensagem';
  }, 2000);
}

// Sistema de notificações melhorado com queue
let notificationQueue = [];
let isShowingNotification = false;

function showNotification(message, type = 'info') {
  notificationQueue.push({message, type});
  
  if (!isShowingNotification) {
    processNotificationQueue();
  }
}

function processNotificationQueue() {
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }
  
  isShowingNotification = true;
  const {message, type} = notificationQueue.shift();
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${getNotificationIcon(type)}"></i>
    <span>${message}</span>
    <button class="notification-close" onclick="closeNotification(this.parentElement)">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    closeNotification(notification);
  }, 4000);
}

function closeNotification(notification) {
  notification.classList.remove('show');
  setTimeout(() => {
    if (notification.parentNode) {
      document.body.removeChild(notification);
    }
    // Processar próxima notificação
    setTimeout(processNotificationQueue, 200);
  }, 300);
}

// Melhorar performance com lazy loading de imagens
function setupLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Adicionar suporte a atalhos de teclado
document.addEventListener('keydown', (event) => {
  // ESC para fechar modais
  if (event.key === 'Escape') {
    closeAllModals();
    
    // Fechar menu mobile
    const navbar = document.getElementById('navbar');
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (navbar?.classList.contains('mobile-open')) {
      navbar.classList.remove('mobile-open');
      toggle?.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  // Ctrl/Cmd + K para focar na busca
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    document.getElementById('search-input')?.focus();
  }
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
      // Fechar menu mobile se estiver aberto
      const navbar = document.getElementById('navbar');
      const toggle = document.querySelector('.mobile-menu-toggle');
      if (navbar && navbar.classList.contains('mobile-open')) {
        navbar.classList.remove('mobile-open');
        toggle.classList.remove('active');
      }
    });
  });

  // Fechar modais clicando fora
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      closeAllModals();
    }
  });

  // Fechar menu mobile ao clicar fora
  document.addEventListener('click', function(e) {
    const navbar = document.getElementById('navbar');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const isClickInsideNav = navbar && navbar.contains(e.target);
    const isClickOnToggle = toggle && toggle.contains(e.target);
    
    if (!isClickInsideNav && !isClickOnToggle && navbar && navbar.classList.contains('mobile-open')) {
      navbar.classList.remove('mobile-open');
      toggle.classList.remove('active');
    }
  });

  // Redimensionamento da janela
  window.addEventListener('resize', function() {
    const navbar = document.getElementById('navbar');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth > 768 && navbar && navbar.classList.contains('mobile-open')) {
      navbar.classList.remove('mobile-open');
      toggle.classList.remove('active');
    }
  });
}

// Função para toggle do menu mobile
function toggleMobileMenu() {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.mobile-menu-toggle');
  
  if (navbar && toggle) {
    navbar.classList.toggle('mobile-open');
    toggle.classList.toggle('active');
  }
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

// Sistema de login
function showLoginModal() {
  document.getElementById('login-modal').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');

  // Validações básicas
  if (!email || !password) {
    showNotification('Por favor, preencha todos os campos', 'error');
    return;
  }

  // Mostrar indicador de carregamento
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Entrando...';
  submitButton.disabled = true;

  // Função assíncrona para lidar com Firebase
  (async () => {
    try {
      // Importar Firebase Service
      const { firebaseService } = await import('./firebase-config.js');
      
      // Tentar fazer login
      const result = await firebaseService.signIn(email, password);
      
      if (result.success) {
        // Login bem-sucedido
        showNotification('Login realizado com sucesso!', 'success');
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          userData: result.userData
        }));
        
        // Fechar modal
        closeLoginModal();
        
        // Atualizar interface do usuário
        if (typeof updateUserInterface === 'function') {
          updateUserInterface(result.userData);
        }
        
        console.log('✅ Login successful:', result.userData);
        
      } else {
        // Se o erro indica que o usuário não existe, redirecionar para registro
        if (result.error === 'Usuário não encontrado' || 
            result.error.includes('user-not-found') ||
            result.error.includes('auth/user-not-found') ||
            result.error.includes('invalid-credential')) {
          
          showNotification('Usuário não encontrado. Redirecionando para cadastro...', 'info');
          console.log('🔄 Redirecionando para cadastro - usuário não existe');
          
          // Aguardar um momento e depois abrir modal de registro
          setTimeout(() => {
            closeLoginModal();
            switchToRegister();
            
            // Pré-preencher o email no formulário de registro
            setTimeout(() => {
              const registerEmailInput = document.querySelector('#registerModal input[name="email"], #register-modal input[name="email"]');
              if (registerEmailInput) {
                registerEmailInput.value = email;
                console.log('✅ Email pré-preenchido no formulário de registro');
              }
            }, 500);
          }, 1500);
          
        } else {
          // Outros erros de autenticação
          console.error('❌ Erro de autenticação:', result.error);
          showNotification(result.error, 'error');
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      showNotification('Erro interno. Tente novamente.', 'error');
    } finally {
      // Restaurar botão
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  })();
}

function switchToRegister() {
  closeLoginModal();
  openRegisterModal();
}

function showForgotPassword() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('forgot-password-modal').style.display = 'block';
}

function closeForgotPasswordModal() {
  document.getElementById('forgot-password-modal').style.display = 'none';
}

function backToLogin() {
  document.getElementById('forgot-password-modal').style.display = 'none';
  document.getElementById('login-modal').style.display = 'block';
}

function handleForgotPassword(event) {
  event.preventDefault();
  const email = event.target.email.value;
  
  // Simular envio de email
  alert('Um link de recuperação foi enviado para: ' + email);
  
  // Fechar modal e voltar para login
  closeForgotPasswordModal();
  
  // Aqui você implementaria a lógica real de recuperação de senha
  // firebase.auth().sendPasswordResetEmail(email)
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
  if (!data.name || !data.email || !data.password) {
    showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
    return;
  }
  
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
  
  // Mostrar indicador de carregamento
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Cadastrando...';
  submitButton.disabled = true;
  
  // Função assíncrona para lidar com Firebase
  (async () => {
    try {
      console.log('🔄 Iniciando processo de registro...', { email: data.email, tipo: registerType });
      
      // Importar Firebase Service
      const { firebaseService } = await import('./firebase-config.js');
      
      // Preparar dados do usuário baseado no tipo
      let userData = {
        nome: data.name,
        tipo: registerType === 'admin' ? 'admin' : 'cliente'
      };
      
      if (registerType === 'cliente') {
        userData = {
          ...userData,
          telefone: data.phone || '',
          endereco: '',
          cidade: '',
          cep: ''
        };
      } else if (registerType === 'admin') {
        userData = {
          ...userData,
          departamento: 'Administração',
          funcionarioId: `ADM_${Date.now()}`,
          permissoes: ['read', 'write', 'admin']
        };
      }
      
      console.log('📝 Dados do usuário preparados:', userData);
      
      // Tentar fazer registro
      const result = await firebaseService.signUp(data.email, data.password, userData);
      
      if (result.success) {
        // Registro bem-sucedido
        console.log('✅ Registro realizado com sucesso:', result);
        closeRegisterModal();
        showNotification(`Cadastro realizado com sucesso! Bem-vindo, ${data.name}!`, 'success');
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          userData: userData
        }));
        
        // Atualizar interface do usuário
        if (typeof updateUserInterface === 'function') {
          updateUserInterface(userData);
        }
        
      } else {
        // Erro no registro
        console.error('❌ Erro no registro:', result.error);
        showNotification(result.error, 'error');
      }
      
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      showNotification('Erro interno. Tente novamente.', 'error');
    } finally {
      // Restaurar botão
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  })();
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

function updateUserInterface(userData) {
  // Atualizar botões de login/logout na navbar
  const loginBtn = document.querySelector('.auth-buttons .btn-primary');
  const signupBtn = document.querySelector('.auth-buttons .btn-secondary');
  
  if (loginBtn && signupBtn && userData) {
    // Esconder botões de login/cadastro
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    
    // Criar botão de usuário logado
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
      <button class="btn btn-outline user-btn">
        <i class="fas fa-user"></i>
        <span>Olá, ${userData.nome || userData.email}</span>
      </button>
      <div class="user-dropdown">
        <a href="#" onclick="showUserProfile()">
          <i class="fas fa-user-circle"></i> Meu Perfil
        </a>
        <a href="#" onclick="showUserOrders()">
          <i class="fas fa-shopping-bag"></i> Meus Pedidos
        </a>
        <a href="#" onclick="handleLogout()">
          <i class="fas fa-sign-out-alt"></i> Sair
        </a>
      </div>
    `;
    
    // Inserir menu do usuário
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
      authButtons.appendChild(userMenu);
    }
  }
}

function handleLogout() {
  // Limpar localStorage
  localStorage.removeItem('currentUser');
  
  // Importar Firebase e fazer logout
  import('./firebase-config.js').then(({ firebaseService }) => {
    firebaseService.logout();
  });
  
  // Restaurar interface original
  location.reload(); // Recarregar página para restaurar estado original
  
  showNotification('Logout realizado com sucesso!', 'success');
}

function showUserProfile() {
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

function showUserOrders() {
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

// Verificar se usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  // Debug Firebase
  console.log('🚀 Iniciando sistema de autenticação...');
  
  // Verificar usuário no localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.userData) {
    console.log('👤 Usuário encontrado no localStorage:', currentUser.userData.nome);
    updateUserInterface(currentUser.userData);
  } else {
    console.log('👤 Nenhum usuário logado encontrado');
  }
  
  // Verificar estado do Firebase
  setTimeout(async () => {
    try {
      const { checkAuth } = await import('./firebase-config.js');
      const firebaseUser = await checkAuth();
      
      if (firebaseUser && !currentUser) {
        console.log('🔄 Sincronizando estado de autenticação...');
        // Usuário está logado no Firebase mas não no localStorage
        const { firebaseService } = await import('./firebase-config.js');
        const userData = await firebaseService.getUserByEmail(firebaseUser.email);
        
        if (userData.success) {
          localStorage.setItem('currentUser', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            userData: userData.user
          }));
          updateUserInterface(userData.user);
        }
      }
    } catch (error) {
      console.error('⚠️ Erro ao verificar estado de autenticação:', error);
    }
  }, 1000);
});

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