// Teste de conectividade do Firebase
// Execute este script no console do navegador para diagnosticar problemas

console.log('🔄 Iniciando diagnóstico detalhado...');

// Teste 1: Verificar se os módulos do Firebase podem ser importados
console.log('\n1️⃣ Testando importação do Firebase...');
import('./firebase-config.js')
  .then(firebaseModule => {
    console.log('✅ Firebase module importado');
    console.log('Exports disponíveis:', Object.keys(firebaseModule));
    
    // Teste 2: Verificar firebaseService
    console.log('\n2️⃣ Testando firebaseService...');
    const { firebaseService } = firebaseModule;
    
    if (!firebaseService) {
      console.error('❌ firebaseService é null/undefined');
      return;
    }
    
    console.log('✅ firebaseService existe');
    console.log('Métodos disponíveis:', Object.getOwnPropertyNames(Object.getPrototypeOf(firebaseService)));
    
    // Teste 3: Verificar método signUp
    console.log('\n3️⃣ Testando método signUp...');
    if (typeof firebaseService.signUp === 'function') {
      console.log('✅ Método signUp disponível');
      
      // Teste 4: Tentar criar usuário
      console.log('\n4️⃣ Tentando criar usuário de teste...');
      const testEmail = `teste${Date.now()}@exemplo.com`;
      const testData = {
        nome: 'Teste User',
        tipo: 'cliente'
      };
      
      return firebaseService.signUp(testEmail, '123456', testData);
    } else {
      console.error('❌ Método signUp não é uma função');
    }
  })
  .then(result => {
    if (result) {
      console.log('\n5️⃣ Resultado do teste de registro:', result);
      if (result.success) {
        console.log('🎉 SUCESSO! Firebase está funcionando perfeitamente!');
      } else {
        console.log('⚠️ Firebase conectado, mas erro no registro:', result.error);
      }
    }
  })
  .catch(error => {
    console.error('\n💥 ERRO NO DIAGNÓSTICO:', error);
    console.error('Stack trace:', error.stack);
  });
