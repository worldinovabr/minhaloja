// Firebase Auth Manager - Gerenciamento de Autenticação
import { firebaseService, getCurrentUser, isAdmin, getUserRole, checkAuth } from './firebase-config.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userRole = null;
    this.userProfile = null;
    this.initializeAuth();
  }

  // Inicializar sistema de autenticação
  async initializeAuth() {
    try {
      // Verificar se há usuário logado
      const user = await checkAuth();
      
      if (user) {
        await this.setUserData(user);
      }

      // Listener para mudanças no estado de autenticação
      firebaseService.onAuthStateChange(async (user) => {
        if (user) {
          await this.setUserData(user);
        } else {
          this.clearUserData();
        }
        this.updateUI();
      });

      console.log('🔐 Sistema de autenticação inicializado');
    } catch (error) {
      console.error('❌ Erro na inicialização da autenticação:', error);
    }
  }

  // Definir dados do usuário
  async setUserData(user) {
    this.currentUser = user;
    this.isAuthenticated = true;

    // Buscar dados adicionais do usuário
    try {
      const userData = await firebaseService.getUserByUID(user.uid);
      if (userData.success) {
        this.userRole = userData.user.role;
        this.userProfile = userData.user;
      } else {
        // Se não encontrar dados no Firestore, criar registro básico
        await this.createUserProfile(user);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }

  // Criar perfil básico para usuário existente
  async createUserProfile(user) {
    try {
      const basicProfile = {
        uid: user.uid,
        email: user.email,
        nome: user.displayName || user.email.split('@')[0],
        role: 'cliente',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      };

      await firebaseService.addDoc(firebaseService.collection(firebaseService.db, 'users'), basicProfile);
      
      this.userRole = 'cliente';
      this.userProfile = basicProfile;
      
      console.log('👤 Perfil básico criado para usuário existente');
    } catch (error) {
      console.error('Erro ao criar perfil básico:', error);
    }
  }

  // Limpar dados do usuário
  clearUserData() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userRole = null;
    this.userProfile = null;
  }

  // Login do usuário com validações aprimoradas
  async login(email, password) {
    try {
      // Mostrar loading
      this.showLoading('Fazendo login...');
      
      // Validações básicas
      if (!email || !password) {
        this.showError('Email e senha são obrigatórios');
        return { success: false, error: 'Campos obrigatórios' };
      }

      if (!this.isValidEmail(email)) {
        this.showError('Formato de email inválido');
        return { success: false, error: 'Email inválido' };
      }

      const result = await firebaseService.signIn(email, password);
      
      if (result.success) {
        this.showSuccess('Login realizado com sucesso!');
        
        // Aguardar dados do usuário serem carregados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirecionar baseado no papel do usuário
        setTimeout(() => {
          if (this.userRole === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'client.html';
          }
        }, 1500);
        
        return { success: true };
      } else {
        this.showError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      this.showError('Erro inesperado no login: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      this.hideLoading();
    }
  }

  // Registro de novo usuário com validações aprimoradas
  async register(email, password, userData) {
    try {
      this.showLoading('Criando conta...');
      
      // Validações básicas
      if (!email || !password || !userData.nome) {
        this.showError('Todos os campos obrigatórios devem ser preenchidos');
        return { success: false, error: 'Campos obrigatórios' };
      }

      if (!this.isValidEmail(email)) {
        this.showError('Formato de email inválido');
        return { success: false, error: 'Email inválido' };
      }

      if (password.length < 6) {
        this.showError('A senha deve ter pelo menos 6 caracteres');
        return { success: false, error: 'Senha muito curta' };
      }

      if (!this.isValidName(userData.nome)) {
        this.showError('Nome deve ter pelo menos 2 caracteres');
        return { success: false, error: 'Nome inválido' };
      }

      // Validações específicas por tipo de usuário
      if (userData.tipo === 'cliente') {
        // Validar telefone se fornecido
        if (userData.telefone && !this.isValidPhone(userData.telefone)) {
          this.showError('Formato de telefone inválido');
          return { success: false, error: 'Telefone inválido' };
        }

        // Validar CEP se fornecido
        if (userData.cep && !this.isValidCEP(userData.cep)) {
          this.showError('Formato de CEP inválido');
          return { success: false, error: 'CEP inválido' };
        }
      }

      if (userData.tipo === 'admin') {
        // Validar campos específicos de admin
        if (!userData.departamento) {
          this.showError('Departamento é obrigatório para administradores');
          return { success: false, error: 'Departamento obrigatório' };
        }
      }

      const result = await firebaseService.signUp(email, password, userData);
      
      if (result.success) {
        this.showSuccess('Conta criada com sucesso!');
        
        // Redirecionar baseado no tipo de usuário
        setTimeout(() => {
          if (userData.tipo === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'client.html';
          }
        }, 1500);
        
        return { success: true };
      } else {
        this.showError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      this.showError('Erro inesperado no registro: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      this.hideLoading();
    }
  }

  // Métodos de validação
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidName(name) {
    return name && name.trim().length >= 2;
  }

  isValidPhone(phone) {
    // Aceita formatos: (11) 99999-9999, 11999999999, +5511999999999
    const phoneRegex = /^(\+55)?(\(?\d{2}\)?)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  isValidCEP(cep) {
    // Formato: 12345-678 ou 12345678
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep.replace(/\s/g, ''));
  }

  // Logout do usuário
  async logout() {
    try {
      const result = await firebaseService.logout();
      
      if (result.success) {
        this.showSuccess('Logout realizado com sucesso!');
        
        // Limpar dados locais
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirecionar para login
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
        
        return { success: true };
      } else {
        this.showError('Erro no logout: ' + result.error);
        return { success: false };
      }
    } catch (error) {
      this.showError('Erro inesperado no logout');
      return { success: false };
    }
  }

  // Verificar se usuário está autenticado
  requireAuth() {
    if (!this.isAuthenticated) {
      this.showError('Acesso negado. Faça login primeiro.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return false;
    }
    return true;
  }

  // Verificar se usuário é admin
  requireAdmin() {
    if (!this.requireAuth()) return false;
    
    if (this.userRole !== 'admin') {
      this.showError('Acesso negado. Apenas administradores podem acessar esta área.');
      setTimeout(() => {
        window.location.href = 'client.html';
      }, 2000);
      return false;
    }
    return true;
  }

  // Atualizar perfil do usuário
  async updateProfile(userData) {
    if (!this.requireAuth()) return { success: false };

    try {
      this.showLoading('Atualizando perfil...');

      // Validações
      if (userData.nome && !this.isValidName(userData.nome)) {
        this.showError('Nome inválido');
        return { success: false, error: 'Nome inválido' };
      }

      if (userData.telefone && !this.isValidPhone(userData.telefone)) {
        this.showError('Telefone inválido');
        return { success: false, error: 'Telefone inválido' };
      }

      if (userData.cep && !this.isValidCEP(userData.cep)) {
        this.showError('CEP inválido');
        return { success: false, error: 'CEP inválido' };
      }

      const result = await firebaseService.updateUser(this.userProfile.id, userData);

      if (result.success) {
        // Atualizar dados locais
        this.userProfile = { ...this.userProfile, ...userData };
        this.showSuccess('Perfil atualizado com sucesso!');
        this.updateUI();
        return { success: true };
      } else {
        this.showError('Erro ao atualizar perfil: ' + result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      this.showError('Erro inesperado ao atualizar perfil');
      return { success: false, error: error.message };
    } finally {
      this.hideLoading();
    }
  }

  // Verificar status do usuário
  async checkUserStatus() {
    if (!this.isAuthenticated) return false;

    try {
      const userData = await firebaseService.getUserByUID(this.currentUser.uid);
      
      if (userData.success) {
        if (!userData.user.ativo) {
          this.showError('Sua conta foi desativada. Entre em contato com o suporte.');
          await this.logout();
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar status do usuário:', error);
      return false;
    }
  }

  // Atualizar interface do usuário
  updateUI() {
    // Atualizar informações do usuário na interface
    const userInfo = document.querySelector('.user-info');
    const loginButton = document.querySelector('.btn-login');
    const userMenu = document.querySelector('.user-menu');
    
    if (this.isAuthenticated && this.currentUser) {
      // Usuário logado
      if (userInfo) {
        userInfo.innerHTML = `
          <div class="user-welcome">
            <span>Olá, ${this.userProfile?.nome || this.currentUser.email}!</span>
            <div class="user-actions">
              <button onclick="authManager.logout()" class="btn-logout">
                <i class="fas fa-sign-out-alt"></i> Sair
              </button>
            </div>
          </div>
        `;
      }
      
      if (loginButton) {
        loginButton.style.display = 'none';
      }
      
      // Mostrar menu do usuário
      if (userMenu) {
        userMenu.style.display = 'block';
      }
      
    } else {
      // Usuário não logado
      if (userInfo) {
        userInfo.innerHTML = '<span>Visitante</span>';
      }
      
      if (loginButton) {
        loginButton.style.display = 'block';
      }
      
      if (userMenu) {
        userMenu.style.display = 'none';
      }
    }
  }

  // Métodos de feedback visual
  showLoading(message) {
    // Criar ou atualizar elemento de loading
    let loadingElement = document.getElementById('auth-loading');
    if (!loadingElement) {
      loadingElement = document.createElement('div');
      loadingElement.id = 'auth-loading';
      loadingElement.className = 'auth-feedback loading';
      document.body.appendChild(loadingElement);
    }
    
    loadingElement.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <span>${message}</span>
      </div>
    `;
    loadingElement.style.display = 'flex';
  }

  hideLoading() {
    const loadingElement = document.getElementById('auth-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    // Criar elemento de mensagem
    const messageElement = document.createElement('div');
    messageElement.className = `auth-message ${type}`;
    messageElement.innerHTML = `
      <div class="message-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(messageElement);
    
    // Animar entrada
    setTimeout(() => {
      messageElement.classList.add('show');
    }, 100);
    
    // Remover após 5 segundos
    setTimeout(() => {
      messageElement.classList.remove('show');
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, 5000);
  }

  // Obter dados do usuário atual
  getCurrentUserData() {
    return {
      user: this.currentUser,
      profile: this.userProfile,
      role: this.userRole,
      isAuthenticated: this.isAuthenticated
    };
  }
}

// CSS para elementos de feedback
const authStyles = `
  .auth-feedback {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  }

  .loading-content {
    background: #fff;
    padding: 2rem;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .auth-message {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fff;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    z-index: 10001;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  }

  .auth-message.show {
    transform: translateX(0);
  }

  .auth-message.success {
    border-left: 4px solid #28a745;
  }

  .auth-message.error {
    border-left: 4px solid #dc3545;
  }

  .message-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .message-content i {
    font-size: 1.2rem;
  }

  .auth-message.success i {
    color: #28a745;
  }

  .auth-message.error i {
    color: #dc3545;
  }

  .user-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .user-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-logout {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }

  .btn-logout:hover {
    background: linear-gradient(135deg, #c82333, #bd2130);
    transform: translateY(-2px);
  }
`;

// Adicionar estilos ao documento
const styleElement = document.createElement('style');
styleElement.textContent = authStyles;
document.head.appendChild(styleElement);

// Criar instância global do gerenciador de autenticação
window.authManager = new AuthManager();

export { AuthManager };
export default window.authManager;
