// Sistema do Cliente
class ClientSystem {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products') || '[]');
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.orders = JSON.parse(localStorage.getItem('orders') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Produtos iniciais se não existirem
        if (this.products.length === 0) {
            this.loadInitialProducts();
        }

        this.setupEventListeners();
        this.displayUserInfo();
        this.loadUserProfile();
        this.renderProducts();
        this.updateCartDisplay();
        this.loadUserOrders();
        this.showSection('produtos');
    }

    loadInitialProducts() {
        this.products = [
            {
                id: 1,
                name: 'Camisa Polo Masculina',
                category: 'roupas',
                price: 89.99,
                stock: 50,
                description: 'Camisa polo 100% algodão, confortável e elegante.',
                image: 'https://via.placeholder.com/300x300/007bff/ffffff?text=Camisa+Polo',
                status: 'ativo'
            },
            {
                id: 2,
                name: 'Vestido Floral Feminino',
                category: 'roupas',
                price: 149.99,
                stock: 30,
                description: 'Vestido floral midi, perfeito para ocasiões especiais.',
                image: 'https://via.placeholder.com/300x300/28a745/ffffff?text=Vestido+Floral',
                status: 'ativo'
            },
            {
                id: 3,
                name: 'Calça Jeans Premium',
                category: 'roupas',
                price: 119.99,
                stock: 40,
                description: 'Calça jeans de alta qualidade, corte moderno.',
                image: 'https://via.placeholder.com/300x300/6c757d/ffffff?text=Calça+Jeans',
                status: 'ativo'
            },
            {
                id: 4,
                name: 'Tênis Esportivo',
                category: 'calcados',
                price: 199.99,
                stock: 25,
                description: 'Tênis confortável para atividades esportivas.',
                image: 'https://via.placeholder.com/300x300/dc3545/ffffff?text=Tênis+Sport',
                status: 'ativo'
            },
            {
                id: 5,
                name: 'Relógio Digital',
                category: 'acessorios',
                price: 299.99,
                stock: 15,
                description: 'Relógio digital com múltiplas funcionalidades.',
                image: 'https://via.placeholder.com/300x300/ffc107/000000?text=Relógio',
                status: 'ativo'
            }
        ];
        this.saveProducts();
    }

    setupEventListeners() {
        // Navegação
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Filtros
        const filterBtn = document.querySelector('[onclick="filterProducts()"]');
        if (filterBtn) {
            filterBtn.onclick = () => this.filterProducts();
        }

        // Formulário de perfil
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.updateProfile(e));
        }

        // Formulário de checkout
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.processCheckout(e));
        }
    }

    displayUserInfo() {
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) {
            userNameSpan.textContent = this.currentUser.name;
        }
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
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    renderProducts() {
        const productList = document.getElementById('product-list');
        if (!productList) return;

        const activeProducts = this.products.filter(p => p.status === 'ativo');
        
        productList.innerHTML = activeProducts.map(product => `
            <div class="card">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300/ccc/666?text=Produto'">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">R$ ${product.price.toFixed(2)}</div>
                <div class="stock-info">Estoque: ${product.stock} unidades</div>
                <button onclick="clientSystem.addToCart(${product.id})" 
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                </button>
            </div>
        `).join('');
    }

    filterProducts() {
        const category = document.getElementById('categoryFilter').value;
        const search = document.getElementById('searchInput').value.toLowerCase();
        
        let filtered = this.products.filter(p => p.status === 'ativo');
        
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }
        
        if (search) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search)
            );
        }

        const productList = document.getElementById('product-list');
        if (!productList) return;

        productList.innerHTML = filtered.map(product => `
            <div class="card">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300/ccc/666?text=Produto'">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">R$ ${product.price.toFixed(2)}</div>
                <div class="stock-info">Estoque: ${product.stock} unidades</div>
                <button onclick="clientSystem.addToCart(${product.id})" 
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                </button>
            </div>
        `).join('');
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
        this.showNotification('Produto adicionado ao carrinho!');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
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
            } else {
                alert('Quantidade excede o estoque disponível');
            }
        }
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.getElementById('cart-count');

        if (!cartItems) return;

        let total = 0;
        let itemCount = 0;

        cartItems.innerHTML = this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;

            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>R$ ${item.price.toFixed(2)} cada</p>
                    </div>
                    <div class="quantity-controls">
                        <button onclick="clientSystem.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="clientSystem.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-total">
                        R$ ${itemTotal.toFixed(2)}
                    </div>
                    <button onclick="clientSystem.removeFromCart(${item.id})" class="btn-secondary">Remover</button>
                </div>
            `;
        }).join('');

        if (cartTotal) cartTotal.textContent = total.toFixed(2);
        if (cartCount) cartCount.textContent = itemCount;
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
        }
    }

    showCheckout() {
        if (this.cart.length === 0) {
            alert('Carrinho está vazio');
            return;
        }

        const modal = document.getElementById('checkoutModal');
        const checkoutItems = document.getElementById('checkout-items');
        const checkoutTotal = document.getElementById('checkout-total');
        const deliveryAddress = document.getElementById('deliveryAddress');

        let total = 0;
        checkoutItems.innerHTML = this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            return `
                <div class="checkout-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>R$ ${itemTotal.toFixed(2)}</span>
                </div>
            `;
        }).join('');

        checkoutTotal.textContent = total.toFixed(2);
        deliveryAddress.value = `${this.currentUser.address}, ${this.currentUser.city} - CEP: ${this.currentUser.cep}`;
        
        modal.style.display = 'block';
    }

    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        modal.style.display = 'none';
    }

    processCheckout(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderData = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userEmail: this.currentUser.email,
            userPhone: this.currentUser.phone,
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            deliveryAddress: formData.get('address'),
            paymentMethod: formData.get('payment'),
            observations: formData.get('observations'),
            status: 'pendente',
            createdAt: new Date().toISOString()
        };

        // Atualizar estoque dos produtos
        this.cart.forEach(cartItem => {
            const product = this.products.find(p => p.id === cartItem.id);
            if (product) {
                product.stock -= cartItem.quantity;
            }
        });

        this.orders.push(orderData);
        this.saveOrders();
        this.saveProducts();

        // Limpar carrinho
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();

        this.closeCheckoutModal();
        alert('Pedido realizado com sucesso! Você pode acompanhar o status na seção "Meus Pedidos".');
        this.showSection('pedidos');
        this.loadUserOrders();
    }

    loadUserOrders() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        const userOrders = this.orders.filter(order => order.userId === this.currentUser.id);

        if (userOrders.length === 0) {
            ordersList.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
            return;
        }

        ordersList.innerHTML = userOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <h3>Pedido #${order.id}</h3>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div class="order-details">
                    <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Total:</strong> R$ ${order.total.toFixed(2)}</p>
                    <p><strong>Pagamento:</strong> ${order.paymentMethod}</p>
                    <p><strong>Entrega:</strong> ${order.deliveryAddress}</p>
                </div>
                <div class="order-items">
                    <h4>Itens:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            ${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    loadUserProfile() {
        const user = this.currentUser;
        if (!user) return;

        document.getElementById('profileName').value = user.name || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profilePhone').value = user.phone || '';
        document.getElementById('profileAddress').value = user.address || '';
        document.getElementById('profileCity').value = user.city || '';
        document.getElementById('profileCep').value = user.cep || '';
    }

    updateProfile(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        // Atualizar dados do usuário atual
        this.currentUser.name = formData.get('name');
        this.currentUser.email = formData.get('email');
        this.currentUser.phone = formData.get('phone');
        this.currentUser.address = formData.get('address');
        this.currentUser.city = formData.get('city');
        this.currentUser.cep = formData.get('cep');

        // Atualizar no localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // Atualizar na lista de usuários
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...this.currentUser };
            localStorage.setItem('users', JSON.stringify(users));
        }

        alert('Perfil atualizado com sucesso!');
        this.displayUserInfo();
    }

    showNotification(message) {
        // Criar notificação temporária
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

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }
}

// Funções globais
function filterProducts() {
    clientSystem.filterProducts();
}

function showCheckout() {
    clientSystem.showCheckout();
}

function closeCheckoutModal() {
    clientSystem.closeCheckoutModal();
}

function clearCart() {
    clientSystem.clearCart();
}

// Inicializar sistema do cliente
let clientSystem;

document.addEventListener('DOMContentLoaded', () => {
    clientSystem = new ClientSystem();
    
    // Definir ano no footer
    const anoSpan = document.getElementById('ano');
    if (anoSpan) {
        anoSpan.textContent = new Date().getFullYear();
    }
});
