// Teste simples para verificar se o Firebase está funcionando
// Abra este arquivo no navegador junto com o console (F12)

console.log('🔄 Iniciando teste básico do Firebase...');

// Teste de importação
import('./firebase-config.js')
  .then(firebase => {
    console.log('✅ Firebase importado com sucesso');
    console.log('Auth disponível:', !!firebase.auth);
    console.log('DB disponível:', !!firebase.db);
    console.log('FirebaseService disponível:', !!firebase.firebaseService);
    
    // Teste de criação de usuário
    const testEmail = `teste${Date.now()}@exemplo.com`;
    const testPassword = '123456';
    const userData = {
      nome: 'Teste Usuario',
      tipo: 'cliente'
    };
    
    console.log('🧪 Testando registro com:', { email: testEmail, userData });
    
    return firebase.firebaseService.signUp(testEmail, testPassword, userData);
  })
  .then(result => {
    console.log('📊 Resultado do teste:', result);
    
    if (result.success) {
      console.log('🎉 SUCESSO! O Firebase está funcionando!');
      alert('✅ Firebase funcionando! Usuário criado com sucesso.');
    } else {
      console.log('❌ ERRO:', result.error);
      alert(`❌ Erro: ${result.error}`);
    }
  })
  .catch(error => {
    console.log('💥 ERRO CRÍTICO:', error);
    alert(`💥 Erro crítico: ${error.message}`);
  });
