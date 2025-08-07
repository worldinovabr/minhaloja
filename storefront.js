// Sistema da Vitrine - Minha Loja
class StorefrontSystem {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products') || '[]');
        this.categories = JSON.parse(localStorage.getItem('categories') || '[]');
        this.cart = JSON.parse(localStorage.getItem('publicCart') || '[]');
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.init();
    }

    init() {
        // Carregar produtos iniciais se não existirem
        if (this.products.length === 0) {
            this.loadInitialProducts();
        }

        // Carregar categorias iniciais se não existirem
        if (this.categories.length === 0) {
            this.loadInitialCategories();
        }

        this.setupEventListeners();
        this.loadFeaturedProducts();
        this.loadAllProducts();
        this.loadHomeCategories();
        this.loadDetailedCategories();
        this.updateCartDisplay();
        this.updateStats();
        this.setCurrentYear();
        
        // Mostrar seção inicial
        this.showSection('inicio');
    }

    loadInitialProducts() {
        this.products = [
            {
                id: 1,
                name: 'Camisa Polo Masculina Premium',
                category: 'roupas',
                price: 89.99,
                stock: 50,
                description: 'Camisa polo 100% algodão, confortável e elegante. Perfeita para o uso casual ou profissional.',
                image: 'https://via.placeholder.com/300x300/007bff/ffffff?text=Camisa+Polo',
                status: 'ativo',
                featured: true
            },
            {
                id: 2,
                name: 'Vestido Floral Feminino',
                category: 'roupas',
                price: 149.99,
                stock: 30,
                description: 'Vestido floral midi, perfeito para ocasiões especiais. Tecido leve e fluido.',
                image: 'https://via.placeholder.com/300x300/e91e63/ffffff?text=Vestido+Floral',
                status: 'ativo',
                featured: true
            },
            {
                id: 3,
                name: 'Calça Jeans Premium',
                category: 'roupas',
                price: 119.99,
                stock: 40,
                description: 'Calça jeans de alta qualidade, corte moderno e confortável.',
                image: 'https://via.placeholder.com/300x300/6c757d/ffffff?text=Calça+Jeans',
                status: 'ativo',
                featured: false
            },
            {
                id: 4,
                name: 'Tênis Esportivo Pro',
                category: 'calcados',
                price: 199.99,
                stock: 25,
                description: 'Tênis esportivo com tecnologia de amortecimento. Ideal para corridas e academia.',
                image: 'https://via.placeholder.com/300x300/ff9800/ffffff?text=Tênis+Sport',
                status: 'ativo',
                featured: true
            },
            {
                id: 5,
                name: 'Relógio Digital Smart',
                category: 'acessorios',
                price: 299.99,
                stock: 15,
                description: 'Relógio digital inteligente com múltiplas funcionalidades e conectividade.',
                image: 'https://via.placeholder.com/300x300/9c27b0/ffffff?text=Relógio+Smart',
                status: 'ativo',
                featured: true
            },
            {
                id: 6,
                name: 'Smartphone Android',
                category: 'eletronicos',
                price: 899.99,
                stock: 20,
                description: 'Smartphone Android com tela de 6.1", 128GB de armazenamento e câmera tripla.',
                image: 'https://via.placeholder.com/300x300/2196f3/ffffff?text=Smartphone',
                status: 'ativo',
                featured: false
            },
            {
                id: 7,
                name: 'Bolsa Feminina Elegante',
                category: 'acessorios',
                price: 79.99,
                stock: 35,
                description: 'Bolsa feminina de couro sintético, espaçosa e elegante.',
                image: 'https://via.placeholder.com/300x300/795548/ffffff?text=Bolsa',
                status: 'ativo',
                featured: false
            },
            {
                id: 8,
                name: 'Sapato Social Masculino',
                category: 'calcados',
                price: 159.99,
                stock: 18,
                description: 'Sapato social masculino em couro legítimo, ideal para eventos formais.',
                image: 'https://via.placeholder.com/300x300/424242/ffffff?text=Sapato+Social',
                status: 'ativo',
                featured: false
            }
        ];
        this.saveProducts();
    }

    loadInitialCategories() {
        this.categories = [
            { 
                id: 1, 
                name: 'Roupas', 
                description: 'Vestuário masculino e feminino para todas as ocasiões',
                image: 'https://via.placeholder.com/250x200/ff6b6b/ffffff?text=Roupas',
                count: 0 
            },
            { 
                id: 2, 
                name: 'Calçados', 
                description: 'Sapatos, tênis e sandálias para todos os estilos',
                image: 'https://via.placeholder.com/250x200/4ecdc4/ffffff?text=Calçados',
                count: 0 
            },
            { 
                id: 3, 
                name: 'Acessórios', 
                description: 'Relógios, bolsas, joias e muito mais',
                image: 'https://via.placeholder.com/250x200/45b7d1/ffffff?text=Acessórios',
                count: 0 
            },
            { 
                id: 4, 
                name: 'Eletrônicos', 
                description: 'Dispositivos eletrônicos e gadgets tecnológicos',
                image: 'https://via.placeholder.com/250x200/f9ca24/000000?text=Eletrônicos',
                count: 0 
            }
        ];
        this.saveCategories();
    }

    setupEventListeners() {
        // Busca no header
        const headerSearch = document.getElementById('header-search');
        if (headerSearch) {
            headerSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProducts();
                }
            });
        }

        // Indicador do carrinho
        const cartIndicator = document.getElementById('cart-indicator');
        if (cartIndicator) {
            cartIndicator.addEventListener('click', () => this.showCartModal());
        }

        // Formulário de contato
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // Atualizar dropdown de categorias dinamicamente
        this.updateCategoriesDropdown();
    }

    showSection(sectionId) {
        // Esconder todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar seção selecionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Atualizar navegação ativa
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.main-nav a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadFeaturedProducts() {
        const featuredContainer = document.getElementById('featured-products');
        if (!featuredContainer) return;

        const featuredProducts = this.products.filter(p => p.featured && p.status === 'ativo').slice(0, 4);

        featuredContainer.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
    }

    loadAllProducts() {
        const productsContainer = document.getElementById('all-products');
        if (!productsContainer) return;

        const activeProducts = this.products.filter(p => p.status === 'ativo');
        productsContainer.innerHTML = activeProducts.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        return `
            <div class="product-card" onclick="storefront.showProductDetails(${product.id})">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/300x300/ccc/666?text=Produto'">
                    ${product.stock <= 5 ? '<span class="stock-badge">Últimas unidades!</span>' : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                    <div class="product-stock">Estoque: ${product.stock} unidades</div>
                    <button onclick="event.stopPropagation(); storefront.addToCart(${product.id})" 
                            class="btn-primary ${product.stock <= 0 ? 'disabled' : ''}"
                            ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock <= 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                    </button>
                </div>
            </div>
        `;
    }

    loadHomeCategories() {
        const categoriesContainer = document.getElementById('home-categories');
        if (!categoriesContainer) return;

        // Atualizar contadores
        this.updateCategoryCounters();

        categoriesContainer.innerHTML = this.categories.map(category => `
            <div class="category-preview-card" onclick="storefront.filterByCategory('${category.name.toLowerCase()}')">
                <img src="${category.image}" alt="${category.name}">
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.count} produtos</p>
                </div>
            </div>
        `).join('');
    }

    loadDetailedCategories() {
        const categoriesContainer = document.getElementById('detailed-categories');
        if (!categoriesContainer) return;

        this.updateCategoryCounters();

        categoriesContainer.innerHTML = this.categories.map(category => `
            <div class="category-detailed-card">
                <div class="category-image">
                    <img src="${category.image}" alt="${category.name}">
                </div>
                <div class="category-content">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                    <div class="category-stats">
                        <span class="product-count">${category.count} produtos disponíveis</span>
                    </div>
                    <button onclick="storefront.filterByCategory('${category.name.toLowerCase()}')" class="btn-primary">
                        Ver Produtos
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterByCategory(categoryName) {
        this.showSection('produtos');
        
        // Atualizar filtro
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = categoryName;
        }
        
        // Aplicar filtro
        this.applyFilters();
        
        // Scroll suave para os produtos
        setTimeout(() => {
            const productsSection = document.getElementById('produtos');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    updateCategoryCounters() {
        this.categories.forEach(category => {
            category.count = this.products.filter(p => 
                p.category === category.name.toLowerCase() && p.status === 'ativo'
            ).length;
        });
    }

    applyFilters() {
        const categoryFilter = document.getElementById('category-filter').value;
        const priceFilter = document.getElementById('price-filter').value;
        
        let filtered = this.products.filter(p => p.status === 'ativo');
        
        // Filtro por categoria
        if (categoryFilter) {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }
        
        // Filtro por preço
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(v => v === '+' ? Infinity : parseFloat(v) || 0);
            filtered = filtered.filter(p => {
                if (max === undefined) return p.price >= min;
                return p.price >= min && p.price <= max;
            });
        }

        const productsContainer = document.getElementById('all-products');
        if (productsContainer) {
            productsContainer.innerHTML = filtered.map(product => this.createProductCard(product)).join('');
        }
    }

    searchProducts() {
        const searchTerm = document.getElementById('header-search').value.toLowerCase();
        if (!searchTerm) return;

        const filtered = this.products.filter(p => 
            p.status === 'ativo' && (
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            )
        );

        // Mostrar seção de produtos
        this.showSection('produtos');

        // Atualizar grid de produtos
        const productsContainer = document.getElementById('all-products');
        if (productsContainer) {
            productsContainer.innerHTML = filtered.map(product => this.createProductCard(product)).join('');
        }

        // Limpar busca
        document.getElementById('header-search').value = '';
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('product-modal');
        const detailsContainer = document.getElementById('product-details');

        detailsContainer.innerHTML = `
            <div class="product-details-content">
                <div class="product-details-image">
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/400x400/ccc/666?text=Produto'">
                </div>
                <div class="product-details-info">
                    <h2>${product.name}</h2>
                    <p class="product-category">Categoria: ${product.category}</p>
                    <div class="product-price-large">R$ ${product.price.toFixed(2)}</div>
                    <div class="product-description-full">${product.description}</div>
                    <div class="product-stock-info">
                        <span class="stock-status ${product.stock <= 5 ? 'low-stock' : ''}">
                            ${product.stock > 0 ? `${product.stock} unidades disponíveis` : 'Produto indisponível'}
                        </span>
                    </div>
                    <div class="product-actions">
                        <button onclick="storefront.addToCart(${product.id})" 
                                class="btn-primary large ${product.stock <= 0 ? 'disabled' : ''}"
                                ${product.stock <= 0 ? 'disabled' : ''}>
                            ${product.stock <= 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    closeProductModal() {
        const modal = document.getElementById('product-modal');
        modal.style.display = 'none';
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || product.stock <= 0) {
            alert('Produto indisponível');
            return;
        }

        const cartItem = this.cart.find(item => item.id === productId);
        
        if (cartItem) {
            if (cartItem.quantity < product.stock) {
                cartItem.quantity++;
            } else {
                alert('Quantidade máxima em estoque atingida');
                return;
            }
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification(`${product.name} adicionado ao carrinho!`);
    }

    showCartModal() {
        const modal = document.getElementById('cart-modal');
        const cartItemsContainer = document.getElementById('cart-items-modal');
        const cartTotalSpan = document.getElementById('cart-total-modal');

        let total = 0;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
        } else {
            cartItemsContainer.innerHTML = this.cart.map(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                return `
                    <div class="cart-item-modal">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p>R$ ${item.price.toFixed(2)} cada</p>
                        </div>
                        <div class="quantity-controls">
                            <button onclick="storefront.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="storefront.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <div class="item-total">R$ ${itemTotal.toFixed(2)}</div>
                        <button onclick="storefront.removeFromCart(${item.id})" class="btn-remove">×</button>
                    </div>
                `;
            }).join('');
        }

        cartTotalSpan.textContent = total.toFixed(2);
        modal.style.display = 'block';
    }

    closeCartModal() {
        const modal = document.getElementById('cart-modal');
        modal.style.display = 'none';
    }

    updateCartQuantity(productId, newQuantity) {
        const cartItem = this.cart.find(item => item.id === productId);
        const product = this.products.find(p => p.id === productId);
        
        if (cartItem && product) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else if (newQuantity <= product.stock) {
                cartItem.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.showCartModal(); // Atualizar modal
            } else {
                alert('Quantidade excede o estoque disponível');
            }
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.showCartModal(); // Atualizar modal
    }

    clearCart() {
        if (this.cart.length === 0) {
            alert('Carrinho já está vazio');
            return;
        }

        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            this.closeCartModal();
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    goToLogin() {
        window.location.href = 'login.html';
    }

    handleContactForm(e) {
        e.preventDefault();
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        e.target.reset();
    }

    updateStats() {
        const totalProductsSpan = document.getElementById('total-products-public');
        const totalCustomersSpan = document.getElementById('total-customers');

        if (totalProductsSpan) {
            totalProductsSpan.textContent = this.products.filter(p => p.status === 'ativo').length;
        }

        if (totalCustomersSpan) {
            totalCustomersSpan.textContent = this.users.filter(u => u.type === 'cliente').length;
        }
    }

    setCurrentYear() {
        const anoSpan = document.getElementById('ano');
        if (anoSpan) {
            anoSpan.textContent = new Date().getFullYear();
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    saveCart() {
        localStorage.setItem('publicCart', JSON.stringify(this.cart));
    }

    // Funções do Dropdown de Categorias
    updateCategoriesDropdown() {
        const dropdown = document.getElementById('categories-dropdown');
        if (!dropdown) return;

        // Manter os primeiros itens fixos e atualizar as categorias dinâmicas
        const dynamicHTML = this.categories.map(category => 
            `<li><a href="#" onclick="filterByCategory('${category.name.toLowerCase()}', event)">
                ${this.getCategoryIcon(category.name)} ${category.name}
                <span class="category-count">(${this.getCategoryProductCount(category.name.toLowerCase())})</span>
            </a></li>`
        ).join('');

        // Reconstruir dropdown mantendo itens estáticos
        dropdown.innerHTML = `
            <li><a href="#" onclick="showAllCategories(event)">📂 Ver Todas as Categorias</a></li>
            <li class="dropdown-divider"></li>
            ${dynamicHTML}
        `;
    }

    getCategoryIcon(categoryName) {
        const icons = {
            'Roupas': '👔',
            'Calçados': '👟', 
            'Acessórios': '💍',
            'Eletrônicos': '📱'
        };
        return icons[categoryName] || '📦';
    }

    getCategoryProductCount(categoryName) {
        return this.products.filter(p => 
            p.category === categoryName && p.status === 'ativo'
        ).length;
    }

    toggleCategoriesDropdown(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const dropdown = document.querySelector('.dropdown');
        const isActive = dropdown.classList.contains('active');
        
        // Fechar outros dropdowns
        this.closeAllDropdowns();
        
        // Toggle do dropdown atual
        if (!isActive) {
            dropdown.classList.add('active');
            this.updateCategoriesDropdown(); // Atualizar contadores
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    showAllCategories(event) {
        event.preventDefault();
        this.closeAllDropdowns();
        this.showSection('categorias');
    }
}

// Funções globais
function showSection(sectionId) {
    storefront.showSection(sectionId);
}

function searchProducts() {
    storefront.searchProducts();
}

function applyFilters() {
    storefront.applyFilters();
}

function closeProductModal() {
    storefront.closeProductModal();
}

function closeCartModal() {
    storefront.closeCartModal();
}

function clearCart() {
    storefront.clearCart();
}

function goToLogin() {
    storefront.goToLogin();
}

// Funções do dropdown de categorias
function toggleCategoriesDropdown(event) {
    storefront.toggleCategoriesDropdown(event);
}

function showAllCategories(event) {
    storefront.showAllCategories(event);
}

// Atualizar função filterByCategory para aceitar event
function filterByCategory(categoryName, event) {
    if (event) {
        event.preventDefault();
        storefront.closeAllDropdowns();
    }
    storefront.filterByCategory(categoryName);
}

// Inicializar sistema da vitrine
let storefront;

document.addEventListener('DOMContentLoaded', () => {
    storefront = new StorefrontSystem();
    
    // Fechar modais ao clicar fora
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});
