// Sistema de Autenticação
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.init();
    }

    init() {
        // Criar usuário admin padrão se não existir
        if (!this.users.find(user => user.email === 'admin@minhaloja.com')) {
            this.users.push({
                id: 1,
                name: 'Administrador',
                email: 'admin@minhaloja.com',
                password: 'admin123',
                type: 'admin',
                createdAt: new Date().toISOString()
            });
            this.saveUsers();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register Form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const userType = formData.get('userType');

        const user = this.users.find(u => 
            u.email === email && 
            u.password === password && 
            u.type === userType
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirecionar baseado no tipo de usuário
            if (user.type === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'client.html';
            }
        } else {
            alert('Credenciais inválidas. Verifique email, senha e tipo de usuário.');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        
        // Verificar se email já existe
        if (this.users.find(u => u.email === email)) {
            alert('Este email já está cadastrado.');
            return;
        }

        const newUser = {
            id: this.users.length + 1,
            name: formData.get('name'),
            email: email,
            password: formData.get('password'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            cep: formData.get('cep'),
            type: 'cliente',
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        this.closeRegisterModal();
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.type === 'admin';
    }

    closeRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) modal.style.display = 'none';
    }
}

// Funções globais para os modais
function showRegisterForm() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'block';
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'none';
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        auth.logout();
    }
}

// Verificar autenticação ao carregar páginas protegidas
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'admin.html' && !auth.isAdmin()) {
        alert('Acesso negado. Apenas administradores podem acessar esta área.');
        window.location.href = 'login.html';
        return false;
    }
    
    if ((currentPage === 'client.html' || currentPage === 'admin.html') && !auth.isAuthenticated()) {
        alert('Você precisa fazer login para acessar esta área.');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Inicializar sistema de autenticação
const auth = new AuthSystem();

// Verificar autenticação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Fechar modais ao clicar fora
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
