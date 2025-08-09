// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0f9Vm8TNyVDwq6kdH0qcGLXjQlruKOQk",
  authDomain: "minha-loja-a9998.firebaseapp.com",
  projectId: "minha-loja-a9998",
  storageBucket: "minha-loja-a9998.firebasestorage.app",
  messagingSenderId: "408609949686",
  appId: "1:408609949686:web:a9141ae65dc5f51c9ca9d7",
  measurementId: "G-5NGEP7NJNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Export Firebase services
export { 
  auth, 
  db, 
  storage, 
  analytics,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL
};

// Firebase Database Service Class
export class FirebaseService {
  
  constructor() {
    this.initializeDatabase();
  }

  // Inicializar estruturas do banco de dados
  async initializeDatabase() {
    try {
      // Verificar e criar coleções se necessário
      await this.ensureCollectionExists('users');
      await this.ensureCollectionExists('products');
      await this.ensureCollectionExists('orders');
      await this.ensureCollectionExists('categories');
      
      // Criar produtos de exemplo se não existirem
      await this.createSampleDataIfNeeded();
      
      console.log('📂 Estruturas do banco de dados inicializadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error);
    }
  }

  // Garantir que uma coleção existe
  async ensureCollectionExists(collectionName) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      if (snapshot.empty && collectionName === 'categories') {
        // Criar categorias padrão
        const defaultCategories = [
          { nome: 'eletrônicos', descricao: 'Dispositivos eletrônicos e gadgets', ativo: true },
          { nome: 'roupas', descricao: 'Vestuário e moda', ativo: true },
          { nome: 'casa', descricao: 'Itens para casa e decoração', ativo: true },
          { nome: 'livros', descricao: 'Livros e materiais educativos', ativo: true },
          { nome: 'esportes', descricao: 'Artigos esportivos e fitness', ativo: true },
          { nome: 'beleza', descricao: 'Cosméticos e produtos de beleza', ativo: true }
        ];

        for (const category of defaultCategories) {
          await addDoc(collection(db, 'categories'), {
            ...category,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        console.log('📋 Categorias padrão criadas');
      }
    } catch (error) {
      console.error(`Erro ao verificar coleção ${collectionName}:`, error);
    }
  }

  // Criar dados de exemplo se necessário
  async createSampleDataIfNeeded() {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      
      if (productsSnapshot.empty) {
        const sampleProducts = [
          {
            nome: 'Smartphone Galaxy Pro',
            categoria: 'eletrônicos',
            preco: 1299.99,
            estoque: 25,
            descricao: 'Smartphone premium com tela AMOLED de 6.7", 256GB de armazenamento, câmera tripla de 108MP',
            imagem: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
            destacado: true,
            ativo: true
          },
          {
            nome: 'Notebook UltraBook',
            categoria: 'eletrônicos',
            preco: 2899.99,
            estoque: 15,
            descricao: 'Notebook ultrabook com processador Intel i7, 16GB RAM, SSD 512GB, tela 14" Full HD',
            imagem: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
            destacado: true,
            ativo: true
          },
          {
            nome: 'Camiseta Premium Cotton',
            categoria: 'roupas',
            preco: 79.90,
            estoque: 50,
            descricao: 'Camiseta 100% algodão premium, corte moderno, disponível em várias cores',
            imagem: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
            destacado: false,
            ativo: true
          },
          {
            nome: 'Tênis Running Pro',
            categoria: 'esportes',
            preco: 299.99,
            estoque: 30,
            descricao: 'Tênis profissional para corrida com tecnologia de amortecimento avançada',
            imagem: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
            destacado: true,
            ativo: true
          },
          {
            nome: 'Mesa de Centro Moderna',
            categoria: 'casa',
            preco: 599.99,
            estoque: 12,
            descricao: 'Mesa de centro em madeira maciça com design moderno e acabamento premium',
            imagem: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
            destacado: false,
            ativo: true
          },
          {
            nome: 'Kit Skincare Completo',
            categoria: 'beleza',
            preco: 189.90,
            estoque: 40,
            descricao: 'Kit completo de cuidados com a pele: cleanser, tônico, sérum e hidratante',
            imagem: 'https://images.unsplash.com/photo-1556228578-dd6f72d4e8b6?w=400&h=300&fit=crop',
            destacado: false,
            ativo: true
          }
        ];

        for (const product of sampleProducts) {
          await addDoc(collection(db, 'products'), {
            ...product,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        console.log('🛍️ Produtos de exemplo criados');
      }
    } catch (error) {
      console.error('Erro ao criar dados de exemplo:', error);
    }
  }

  // Authentication Methods com validação aprimorada
  async signIn(email, password) {
    try {
      // Validar dados de entrada
      if (!email || !password) {
        return { success: false, error: 'Email e senha são obrigatórios' };
      }

      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Email inválido' };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Buscar dados adicionais do usuário
      const userData = await this.getUserByEmail(email);
      
      if (userData.success) {
        // Atualizar último login
        await this.updateUserLastLogin(userData.user.id);
      }

      return { 
        success: true, 
        user: userCredential.user,
        userData: userData.success ? userData.user : null
      };
    } catch (error) {
      return { 
        success: false, 
        error: this.getAuthErrorMessage(error.code) 
      };
    }
  }

  async signUp(email, password, userData) {
    try {
      // Validações
      if (!email || !password || !userData.nome) {
        return { success: false, error: 'Dados obrigatórios não preenchidos' };
      }

      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Email inválido' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
      }

      // Verificar se email já existe
      const existingUser = await this.getUserByEmail(email);
      if (existingUser.success) {
        return { success: false, error: 'Email já está em uso' };
      }

      // Validações específicas para admin
      if (userData.tipo === 'admin') {
        if (!userData.departamento || !userData.funcionarioId) {
          return { success: false, error: 'Dados de administrador incompletos' };
        }
        
        // Verificar se já existe um admin com o mesmo funcionarioId
        const existingAdmin = await this.getAdminByEmployeeId(userData.funcionarioId);
        if (existingAdmin.success) {
          return { success: false, error: 'ID de funcionário já está em uso' };
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Preparar dados do usuário baseado no tipo
      let userDocData = {
        uid: userCredential.user.uid,
        email: email,
        nome: userData.nome,
        role: userData.tipo || 'cliente',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      };

      // Adicionar campos específicos baseado no tipo
      if (userData.tipo === 'cliente') {
        userDocData = {
          ...userDocData,
          telefone: userData.telefone || '',
          endereco: userData.endereco || '',
          cidade: userData.cidade || '',
          cep: userData.cep || '',
          compras: [],
          wishlist: [],
          enderecosEntrega: []
        };
      } else if (userData.tipo === 'admin') {
        userDocData = {
          ...userDocData,
          departamento: userData.departamento,
          funcionarioId: userData.funcionarioId,
          permissoes: userData.permissoes || ['read', 'write'],
          nivel: 'administrador',
          ultimoAcesso: new Date()
        };
      }

      // Salvar dados do usuário no Firestore
      await addDoc(collection(db, 'users'), userDocData);

      // Log de auditoria para admins
      if (userData.tipo === 'admin') {
        await this.logAdminAction({
          action: 'ADMIN_REGISTERED',
          adminId: userCredential.user.uid,
          details: {
            email: email,
            departamento: userData.departamento,
            funcionarioId: userData.funcionarioId
          },
          timestamp: new Date()
        });
      }

      return { success: true, user: userCredential.user, userType: userData.tipo };
    } catch (error) {
      return { 
        success: false, 
        error: this.getAuthErrorMessage(error.code) 
      };
    }
  }

  // Atualizar último login
  async updateUserLastLogin(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Obter mensagem de erro amigável
  getAuthErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
    };
    return errorMessages[errorCode] || 'Erro desconhecido';
  }

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Função para verificar admin por ID de funcionário
  async getAdminByEmployeeId(employeeId) {
    try {
      const usersQuery = query(
        collection(db, 'users'), 
        where('funcionarioId', '==', employeeId),
        where('role', '==', 'admin')
      );
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const adminDoc = querySnapshot.docs[0];
        return { 
          success: true, 
          admin: { id: adminDoc.id, ...adminDoc.data() } 
        };
      }
      
      return { success: false, message: 'Admin não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Função para log de ações de admin
  async logAdminAction(actionData) {
    try {
      await addDoc(collection(db, 'admin_logs'), {
        ...actionData,
        timestamp: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar log de admin:', error);
      return { success: false, error: error.message };
    }
  }

  // Função para verificar se um usuário é admin
  async isUserAdmin(uid) {
    try {
      const userQuery = query(
        collection(db, 'users'), 
        where('uid', '==', uid),
        where('role', '==', 'admin'),
        where('ativo', '==', true)
      );
      const querySnapshot = await getDocs(userQuery);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      return false;
    }
  }

  // Função para obter dados completos do usuário por UID
  async getUserByUID(uid) {
    try {
      const usersQuery = query(collection(db, 'users'), where('uid', '==', uid));
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { 
          success: true, 
          user: { id: userDoc.id, ...userDoc.data() } 
        };
      }
      
      return { success: false, message: 'Usuário não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Products Methods com auto-estruturação
  async addProduct(productData) {
    try {
      // Validar dados do produto
      if (!productData.nome || !productData.categoria || !productData.preco) {
        return { success: false, error: 'Dados obrigatórios do produto não preenchidos' };
      }

      // Garantir que a categoria existe
      await this.ensureCategoryExists(productData.categoria);

      // Estrutura padrão do produto
      const product = {
        nome: productData.nome,
        categoria: productData.categoria.toLowerCase(),
        preco: parseFloat(productData.preco),
        estoque: parseInt(productData.estoque) || 0,
        descricao: productData.descricao || '',
        imagem: productData.imagem || '',
        destacado: productData.destacado || false,
        ativo: productData.ativo !== false, // Default true
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'products'), product);
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Garantir que categoria existe
  async ensureCategoryExists(categoryName) {
    try {
      const q = query(collection(db, 'categories'), where('nome', '==', categoryName.toLowerCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Criar categoria automaticamente
        await addDoc(collection(db, 'categories'), {
          nome: categoryName.toLowerCase(),
          descricao: `Categoria ${categoryName}`,
          ativo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`📂 Categoria '${categoryName}' criada automaticamente`);
      }
    } catch (error) {
      console.error('Erro ao verificar/criar categoria:', error);
    }
  }

  async getProducts() {
    try {
      // Buscar apenas produtos ativos por padrão
      const q = query(collection(db, 'products'), where('ativo', '==', true));
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateProduct(productId, productData) {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Garantir que categoria existe se foi alterada
      if (productData.categoria) {
        await this.ensureCategoryExists(productData.categoria);
      }

      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteProduct(productId) {
    try {
      // Soft delete - apenas marcar como inativo
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ativo: false,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Orders Methods com estruturação automática
  async createOrder(orderData) {
    try {
      // Validar dados do pedido
      if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
        return { success: false, error: 'Dados do pedido inválidos' };
      }

      // Estrutura padrão do pedido
      const order = {
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        orderNumber: orderData.orderNumber || this.generateOrderNumber(),
        customerInfo: {
          nome: orderData.customerInfo?.nome || '',
          telefone: orderData.customerInfo?.telefone || '',
          email: orderData.userEmail
        },
        items: orderData.items.map(item => ({
          id: item.id,
          nome: item.nome,
          preco: parseFloat(item.preco),
          quantity: parseInt(item.quantity),
          imagem: item.imagem || ''
        })),
        total: parseFloat(orderData.total),
        paymentMethod: orderData.paymentMethod || 'Cartão de Crédito',
        deliveryAddress: orderData.deliveryAddress || {},
        status: 'pendente',
        statusHistory: [{
          status: 'pendente',
          date: new Date(),
          comment: 'Pedido criado'
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'orders'), order);
      
      // Atualizar estoque dos produtos
      await this.updateProductStock(order.items);
      
      return { success: true, id: docRef.id, orderNumber: order.orderNumber };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Atualizar estoque após pedido
  async updateProductStock(items) {
    try {
      for (const item of items) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDocs(query(collection(db, 'products'), where('__name__', '==', item.id)));
        
        if (!productSnap.empty) {
          const productData = productSnap.docs[0].data();
          const newStock = Math.max(0, (productData.estoque || 0) - item.quantity);
          
          await updateDoc(productRef, {
            estoque: newStock,
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
    }
  }

  // Gerar número único de pedido
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const time = date.getTime().toString().slice(-6);
    
    return `${year}${month}${day}${time}`;
  }

  async getOrders(userId = null) {
    try {
      let q;
      if (userId) {
        q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Converter timestamps do Firestore para objetos Date
        orders.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        });
      });
      return { success: true, orders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      // Buscar pedido atual para adicionar ao histórico
      const orderSnap = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)));
      
      if (!orderSnap.empty) {
        const currentOrder = orderSnap.docs[0].data();
        const statusHistory = currentOrder.statusHistory || [];
        
        // Adicionar novo status ao histórico
        statusHistory.push({
          status: status,
          date: new Date(),
          comment: `Status alterado para ${status}`
        });

        await updateDoc(orderRef, {
          status: status,
          statusHistory: statusHistory,
          updatedAt: new Date()
        });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Users Methods com estruturação automática
  async getUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({ 
          id: doc.id, 
          ...data,
          // Não expor dados sensíveis
          password: undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : data.lastLogin
        });
      });
      return { success: true, users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserByEmail(email) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return { 
          success: true, 
          user: { 
            id: querySnapshot.docs[0].id, 
            ...userData,
            createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
            updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
            lastLogin: userData.lastLogin?.toDate ? userData.lastLogin.toDate() : userData.lastLogin
          } 
        };
      } else {
        return { success: false, error: 'Usuário não encontrado' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Atualizar dados do usuário
  async updateUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Buscar usuário por UID
  async getUserByUID(uid) {
    try {
      const q = query(collection(db, 'users'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return { 
          success: true, 
          user: { 
            id: querySnapshot.docs[0].id, 
            ...userData,
            createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
            updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
            lastLogin: userData.lastLogin?.toDate ? userData.lastLogin.toDate() : userData.lastLogin
          } 
        };
      } else {
        return { success: false, error: 'Usuário não encontrado' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Categories Methods
  async getCategories() {
    try {
      const q = query(collection(db, 'categories'), where('ativo', '==', true));
      const querySnapshot = await getDocs(q);
      const categories = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, categories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addCategory(categoryData) {
    try {
      const category = {
        nome: categoryData.nome.toLowerCase(),
        descricao: categoryData.descricao || '',
        ativo: categoryData.ativo !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'categories'), category);
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // File Upload Methods
  async uploadImage(file, path) {
    try {
      const storageRef = ref(storage, `images/${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Real-time listeners
  onProductsChange(callback) {
    return onSnapshot(collection(db, 'products'), callback);
  }

  onOrdersChange(callback) {
    return onSnapshot(collection(db, 'orders'), callback);
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

// Create and export a singleton instance
export const firebaseService = new FirebaseService();

// Helper function to get current user
export const getCurrentUser = () => auth.currentUser;

// Helper function to check if user is admin
export const isAdmin = async (user) => {
  if (!user) return false;
  
  try {
    const result = await firebaseService.getUserByUID(user.uid);
    return result.success && result.user.role === 'admin';
  } catch (error) {
    return false;
  }
};

// Helper function to get user role
export const getUserRole = async (user) => {
  if (!user) return null;
  
  try {
    const result = await firebaseService.getUserByUID(user.uid);
    return result.success ? result.user.role : null;
  } catch (error) {
    return null;
  }
};

// Helper function to check authentication
export const checkAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Database initialization and health check
export const initializeApp = async () => {
  try {
    console.log('🔥 Inicializando Firebase...');
    
    // Verificar conexão
    const testQuery = await getDocs(collection(db, 'users'));
    console.log('✅ Conexão com Firebase estabelecida');
    
    // Inicializar estruturas
    await firebaseService.initializeDatabase();
    
    console.log('🎉 Firebase totalmente inicializado e pronto para uso!');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro na inicialização do Firebase:', error);
    return { success: false, error: error.message };
  }
};

// Auto-inicializar quando o módulo for carregado
initializeApp();

console.log('🔥 Firebase configurado e pronto para uso!');
