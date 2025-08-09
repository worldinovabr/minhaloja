// Firebase Configuration - Versão Limpa
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA0f9Vm8TNyVDwq6kdH0qcGLXjQlruKOQk",
  authDomain: "minha-loja-a9998.firebaseapp.com",
  projectId: "minha-loja-a9998",
  storageBucket: "minha-loja-a9998.firebasestorage.app",
  messagingSenderId: "408609949686",
  appId: "1:408609949686:web:a9141ae65dc5f51c9ca9d7",
  measurementId: "G-5NGEP7NJNL"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Classe simples para autenticação
class SimpleFirebaseAuth {
  constructor() {
    console.log('🔄 SimpleFirebaseAuth inicializado');
  }

  async signUp(email, password, userData) {
    try {
      console.log('🔄 Tentando criar usuário:', email);
      
      // Validações básicas
      if (!email || !password || !userData.nome) {
        return { success: false, error: 'Dados obrigatórios não preenchidos' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
      }

      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Usuário criado no Firebase Auth:', userCredential.user.uid);
      
      // Preparar dados para salvar no Firestore
      const userDocData = {
        uid: userCredential.user.uid,
        email: email,
        nome: userData.nome,
        tipo: userData.tipo || 'cliente',
        telefone: userData.telefone || '',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Salvar no Firestore
      const docRef = await addDoc(collection(db, 'users'), userDocData);
      console.log('✅ Dados salvos no Firestore:', docRef.id);

      return { 
        success: true, 
        user: userCredential.user, 
        userData: userDocData 
      };
      
    } catch (error) {
      console.error('❌ Erro no signUp:', error);
      
      // Tratar erros específicos do Firebase
      let errorMessage = 'Erro desconhecido';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está cadastrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet';
          break;
        default:
          errorMessage = error.message || 'Erro ao criar conta';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async signIn(email, password) {
    try {
      console.log('🔄 Tentando login:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login realizado:', userCredential.user.uid);
      
      // Buscar dados do usuário no Firestore
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      let userData = null;
      if (!querySnapshot.empty) {
        userData = querySnapshot.docs[0].data();
      }

      return { 
        success: true, 
        user: userCredential.user, 
        userData: userData 
      };
      
    } catch (error) {
      console.error('❌ Erro no signIn:', error);
      
      let errorMessage = 'Erro no login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        default:
          errorMessage = error.message || 'Erro no login';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Exportar instância
export const firebaseService = new SimpleFirebaseAuth();
export { auth, db };
