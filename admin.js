// Sistema Administrativo
class AdminSystem {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products') || '[]');
        this.orders = JSON.parse(localStorage.getItem('orders') || '[]');
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.categories = JSON.parse(localStorage.getItem('categories') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        if (!this.currentUser || this.currentUser.type !== 'admin') {
            alert('Acesso negado. Apenas administradores podem acessar esta área.');
            window.location.href = 'login.html';
            return;
        }

        // Categorias iniciais se não existirem
        if (this.categories.length === 0) {
            this.loadInitialCategories();
        }

        this.setupEventListeners();
        this.displayAdminInfo();
        this.loadDashboard();
        this.loadProducts();
        this.loadOrders();
        this.loadClients();
        this.loadCategories();
        this.showSection('dashboard');
    }

    loadInitialCategories() {
        this.categories = [
            { id: 1, name: 'Roupas', description: 'Vestuário em geral', count: 0 },
            { id: 2, name: 'Calçados', description: 'Sapatos, tênis, sandálias', count: 0 },
            { id: 3, name: 'Acessórios', description: 'Relógios, bolsas, joias', count: 0 },
            { id: 4, name: 'Eletrônicos', description: 'Dispositivos eletrônicos', count: 0 }
        ];
        this.saveCategories();
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

        // Formulário de produtos
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.saveProduct(e));
        }

        // Formulário de categorias
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => this.saveCategory(e));
        }
    }

    displayAdminInfo() {
        const adminNameSpan = document.getElementById('admin-name');
        if (adminNameSpan) {
            adminNameSpan.textContent = this.currentUser.name;
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

    loadDashboard() {
        // Estatísticas gerais
        const totalProducts = document.getElementById('total-products');
        const pendingOrders = document.getElementById('pending-orders');
        const totalClients = document.getElementById('total-clients');
        const monthlySales = document.getElementById('monthly-sales');

        if (totalProducts) totalProducts.textContent = this.products.length;
        
        const pending = this.orders.filter(order => order.status === 'pendente').length;
        if (pendingOrders) pendingOrders.textContent = pending;

        const clients = this.users.filter(user => user.type === 'cliente').length;
        if (totalClients) totalClients.textContent = clients;

        // Vendas do mês atual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyOrdersTotal = this.orders
            .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getMonth() === currentMonth && 
                       orderDate.getFullYear() === currentYear;
            })
            .reduce((total, order) => total + order.total, 0);

        if (monthlySales) monthlySales.textContent = monthlyOrdersTotal.toFixed(2);

        // Pedidos recentes
        this.loadRecentOrders();
    }

    loadRecentOrders() {
        const recentOrdersList = document.getElementById('recent-orders-list');
        if (!recentOrdersList) return;

        const recentOrders = this.orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        recentOrdersList.innerHTML = recentOrders.map(order => `
            <div class="recent-order-item">
                <div>
                    <strong>Pedido #${order.id}</strong>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div>
                    Cliente: ${order.userName} - R$ ${order.total.toFixed(2)}
                </div>
                <div class="order-date">
                    ${new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </div>
            </div>
        `).join('');
    }

    loadProducts() {
        const tbody = document.getElementById('products-tbody');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge status-${product.status}">${product.status}</span></td>
                <td>
                    <button onclick="adminSystem.editProduct(${product.id})" class="btn-secondary">Editar</button>
                    <button onclick="adminSystem.deleteProduct(${product.id})" class="btn-secondary">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    loadOrders() {
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;

        const sortedOrders = this.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        tbody.innerHTML = sortedOrders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.userName}</td>
                <td>${new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>R$ ${order.total.toFixed(2)}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>
                    <button onclick="adminSystem.viewOrderDetails(${order.id})" class="btn-primary">Detalhes</button>
                </td>
            </tr>
        `).join('');
    }

    loadClients() {
        const tbody = document.getElementById('clients-tbody');
        if (!tbody) return;

        const clients = this.users.filter(user => user.type === 'cliente');

        tbody.innerHTML = clients.map(client => {
            const clientOrders = this.orders.filter(order => order.userId === client.id).length;
            
            return `
                <tr>
                    <td>${client.id}</td>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.phone || 'Não informado'}</td>
                    <td>${new Date(client.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>${clientOrders}</td>
                    <td>
                        <button onclick="adminSystem.viewClientDetails(${client.id})" class="btn-primary">Detalhes</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadCategories() {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;

        // Atualizar contadores de categoria
        this.categories.forEach(category => {
            category.count = this.products.filter(p => p.category === category.name.toLowerCase()).length;
        });

        categoriesList.innerHTML = this.categories.map(category => `
            <div class="category-card">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="category-stats">
                    <span>${category.count} produtos</span>
                </div>
                <div class="category-actions">
                    <button onclick="adminSystem.editCategory(${category.id})" class="btn-secondary">Editar</button>
                    <button onclick="adminSystem.deleteCategory(${category.id})" class="btn-secondary">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    // Gestão de Produtos
    showAddProductModal() {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');
        
        title.textContent = 'Adicionar Produto';
        form.reset();
        document.getElementById('productId').value = '';
        modal.style.display = 'block';
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        
        title.textContent = 'Editar Produto';
        
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productStatus').value = product.status;
        
        modal.style.display = 'block';
    }

    saveProduct(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const productId = formData.get('id');
        
        const productData = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            description: formData.get('description'),
            image: formData.get('image') || 'https://via.placeholder.com/300x300/ccc/666?text=Produto',
            status: formData.get('status')
        };

        if (productId) {
            // Editar produto existente
            const productIndex = this.products.findIndex(p => p.id === parseInt(productId));
            if (productIndex !== -1) {
                this.products[productIndex] = { ...this.products[productIndex], ...productData };
            }
        } else {
            // Adicionar novo produto
            const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
            this.products.push({ id: newId, ...productData });
        }

        this.saveProducts();
        this.loadProducts();
        this.loadDashboard();
        this.closeProductModal();
        alert('Produto salvo com sucesso!');
    }

    deleteProduct(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.products = this.products.filter(p => p.id !== id);
            this.saveProducts();
            this.loadProducts();
            this.loadDashboard();
        }
    }

    closeProductModal() {
        const modal = document.getElementById('productModal');
        modal.style.display = 'none';
    }

    // Gestão de Categorias
    showAddCategoryModal() {
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        
        form.reset();
        modal.style.display = 'block';
    }

    saveCategory(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newId = this.categories.length > 0 ? Math.max(...this.categories.map(c => c.id)) + 1 : 1;
        
        const categoryData = {
            id: newId,
            name: formData.get('name'),
            description: formData.get('description'),
            count: 0
        };

        this.categories.push(categoryData);
        this.saveCategories();
        this.loadCategories();
        this.closeCategoryModal();
        alert('Categoria adicionada com sucesso!');
    }

    deleteCategory(id) {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            this.categories = this.categories.filter(c => c.id !== id);
            this.saveCategories();
            this.loadCategories();
        }
    }

    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.style.display = 'none';
    }

    // Gestão de Pedidos
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('orderDetailsModal');
        const orderDetailId = document.getElementById('orderDetailId');
        const orderDetailsContent = document.getElementById('orderDetailsContent');
        const orderStatusUpdate = document.getElementById('orderStatusUpdate');

        orderDetailId.textContent = order.id;
        orderStatusUpdate.value = order.status;

        orderDetailsContent.innerHTML = `
            <div class="order-info">
                <div class="info-section">
                    <h3>Informações do Cliente</h3>
                    <p><strong>Nome:</strong> ${order.userName}</p>
                    <p><strong>Email:</strong> ${order.userEmail}</p>
                    <p><strong>Telefone:</strong> ${order.userPhone}</p>
                </div>
                
                <div class="info-section">
                    <h3>Dados do Pedido</h3>
                    <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
                    <p><strong>Total:</strong> R$ ${order.total.toFixed(2)}</p>
                    <p><strong>Pagamento:</strong> ${order.paymentMethod}</p>
                </div>
                
                <div class="info-section">
                    <h3>Endereço de Entrega</h3>
                    <p>${order.deliveryAddress}</p>
                </div>
                
                ${order.observations ? `
                <div class="info-section">
                    <h3>Observações</h3>
                    <p>${order.observations}</p>
                </div>
                ` : ''}
                
                <div class="info-section">
                    <h3>Itens do Pedido</h3>
                    <div class="order-items-detail">
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">Qtd: ${item.quantity}</span>
                                <span class="item-price">R$ ${item.price.toFixed(2)}</span>
                                <span class="item-total">Total: R$ ${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    updateOrderStatus() {
        const orderId = parseInt(document.getElementById('orderDetailId').textContent);
        const newStatus = document.getElementById('orderStatusUpdate').value;

        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = newStatus;
            this.saveOrders();
            this.loadOrders();
            this.loadDashboard();
            this.closeOrderDetailsModal();
            alert('Status do pedido atualizado com sucesso!');
        }
    }

    closeOrderDetailsModal() {
        const modal = document.getElementById('orderDetailsModal');
        modal.style.display = 'none';
    }

    // Filtros
    filterAdminProducts() {
        const category = document.getElementById('adminCategoryFilter').value;
        const search = document.getElementById('adminSearchInput').value.toLowerCase();
        
        let filtered = this.products;
        
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }
        
        if (search) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search)
            );
        }

        const tbody = document.getElementById('products-tbody');
        if (!tbody) return;

        tbody.innerHTML = filtered.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge status-${product.status}">${product.status}</span></td>
                <td>
                    <button onclick="adminSystem.editProduct(${product.id})" class="btn-secondary">Editar</button>
                    <button onclick="adminSystem.deleteProduct(${product.id})" class="btn-secondary">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    filterOrders() {
        const status = document.getElementById('orderStatusFilter').value;
        const date = document.getElementById('orderDateFilter').value;
        
        let filtered = this.orders;
        
        if (status) {
            filtered = filtered.filter(o => o.status === status);
        }
        
        if (date) {
            const filterDate = new Date(date).toDateString();
            filtered = filtered.filter(o => new Date(o.createdAt).toDateString() === filterDate);
        }

        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;

        tbody.innerHTML = filtered.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.userName}</td>
                <td>${new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>R$ ${order.total.toFixed(2)}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>
                    <button onclick="adminSystem.viewOrderDetails(${order.id})" class="btn-primary">Detalhes</button>
                </td>
            </tr>
        `).join('');
    }

    filterClients() {
        const search = document.getElementById('clientSearchInput').value.toLowerCase();
        const clients = this.users.filter(user => user.type === 'cliente');
        
        let filtered = clients;
        
        if (search) {
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search)
            );
        }

        const tbody = document.getElementById('clients-tbody');
        if (!tbody) return;

        tbody.innerHTML = filtered.map(client => {
            const clientOrders = this.orders.filter(order => order.userId === client.id).length;
            
            return `
                <tr>
                    <td>${client.id}</td>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.phone || 'Não informado'}</td>
                    <td>${new Date(client.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>${clientOrders}</td>
                    <td>
                        <button onclick="adminSystem.viewClientDetails(${client.id})" class="btn-primary">Detalhes</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Métodos de salvamento
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }
}

// Funções globais
function showAddProductModal() {
    adminSystem.showAddProductModal();
}

function closeProductModal() {
    adminSystem.closeProductModal();
}

function showAddCategoryModal() {
    adminSystem.showAddCategoryModal();
}

function closeCategoryModal() {
    adminSystem.closeCategoryModal();
}

function closeOrderDetailsModal() {
    adminSystem.closeOrderDetailsModal();
}

function updateOrderStatus() {
    adminSystem.updateOrderStatus();
}

function filterAdminProducts() {
    adminSystem.filterAdminProducts();
}

function filterOrders() {
    adminSystem.filterOrders();
}

function filterClients() {
    adminSystem.filterClients();
}

// Inicializar sistema administrativo
let adminSystem;

document.addEventListener('DOMContentLoaded', () => {
    adminSystem = new AdminSystem();
    
    // Definir ano no footer
    const anoSpan = document.getElementById('ano');
    if (anoSpan) {
        anoSpan.textContent = new Date().getFullYear();
    }
});
