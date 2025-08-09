// Configurações de Autenticação - Minha Loja
// Estilo worldinova - Simples e eficiente

// ===== CONFIGURAÇÕES BÁSICAS =====
const AUTH_CONFIG = {
  // Códigos de administrador
  ADMIN_CODES: ['ADMIN2024', 'SUPER2024'],
  
  // Configurações de validação
  MIN_PASSWORD_LENGTH: 6,
  
  // Mensagens de feedback
  MESSAGES: {
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    REGISTER_SUCCESS: 'Cadastro realizado com sucesso! Bem-vindo',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
    USER_NOT_FOUND: 'Usuário não encontrado. Redirecionando para cadastro...',
    INVALID_CREDENTIALS: 'Email ou senha incorretos',
    FILL_ALL_FIELDS: 'Por favor, preencha todos os campos',
    PASSWORD_MISMATCH: 'As senhas não coincidem',
    PASSWORD_TOO_SHORT: 'A senha deve ter pelo menos 6 caracteres',
    INVALID_ADMIN_CODE: 'Código de administrador inválido',
    CONNECTION_ERROR: 'Erro de conexão. Verifique sua internet.',
    INTERNAL_ERROR: 'Erro interno. Tente novamente.'
  },
  
  // Timeouts e delays
  REDIRECT_DELAY: 1500,
  SYNC_DELAY: 1000,
  PREFILL_DELAY: 500
};

// ===== UTILITÁRIOS DE AUTENTICAÇÃO =====
const AuthUtils = {
  // Verificar se é erro de usuário não encontrado
  isUserNotFoundError(error) {
    const notFoundErrors = [
      'usuário não encontrado',
      'user-not-found',
      'auth/user-not-found',
      'invalid-credential',
      'invalid-email'
    ];
    
    return notFoundErrors.some(errorType => 
      error.toLowerCase().includes(errorType.toLowerCase())
    );
  },
  
  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validar senha
  isValidPassword(password) {
    return password && password.length >= AUTH_CONFIG.MIN_PASSWORD_LENGTH;
  },
  
  // Verificar código de admin
  isValidAdminCode(code) {
    return AUTH_CONFIG.ADMIN_CODES.includes(code);
  },
  
  // Gerar ID único para administrador
  generateAdminId() {
    return `ADM_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  },
  
  // Formatar dados do usuário para exibição
  formatUserDisplayName(userData) {
    if (userData.nome) return userData.nome;
    if (userData.email) return userData.email.split('@')[0];
    return 'Usuário';
  },
  
  // Verificar se sessão é válida (não expirada)
  isSessionValid(sessionData) {
    if (!sessionData || !sessionData.loginTime) return false;
    
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    // Sessão válida por 24 horas
    return hoursDiff < 24;
  }
};

// ===== LOGGER SIMPLES =====
const AuthLogger = {
  info(message, data = null) {
    console.log(`ℹ️ [AUTH] ${message}`, data || '');
  },
  
  success(message, data = null) {
    console.log(`✅ [AUTH] ${message}`, data || '');
  },
  
  warn(message, data = null) {
    console.warn(`⚠️ [AUTH] ${message}`, data || '');
  },
  
  error(message, data = null) {
    console.error(`❌ [AUTH] ${message}`, data || '');
  }
};

// ===== EXPORTAR CONFIGURAÇÕES =====
window.AUTH_CONFIG = AUTH_CONFIG;
window.AuthUtils = AuthUtils;
window.AuthLogger = AuthLogger;

AuthLogger.info('Configurações de autenticação carregadas com sucesso');
