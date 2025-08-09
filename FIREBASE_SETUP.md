# 🔥 Guia de Configuração do Firebase

## ⚠️ ATENÇÃO: Passos Obrigatórios para Funcionar

### 1. **Configurar Regras do Firestore**

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto: **minha-loja-a9998**
3. Vá em **Firestore Database** > **Rules**
4. Substitua as regras atuais pelo conteúdo do arquivo `firestore-rules.txt`
5. Clique em **Publicar**

### 2. **Ativar Autenticação por Email/Senha**

1. No Console do Firebase, vá em **Authentication**
2. Clique na aba **Sign-in method**
3. Habilite **Email/Password**
4. Salve as alterações

### 3. **Verificar Configurações do Projeto**

- **Nome do Projeto**: minha-loja-a9998
- **URL de Auth**: minha-loja-a9998.firebaseapp.com
- **Project ID**: minha-loja-a9998

### 4. **Testar a Configuração**

1. Abra: `http://localhost:8000/firebase-diagnostico.html`
2. Execute todos os testes
3. Se algum teste falhar, verifique:
   - Regras do Firestore
   - Configuração de Authentication
   - Conexão com a internet

### 5. **Códigos de Erro Comuns**

| Erro | Causa | Solução |
|------|-------|---------|
| `permission-denied` | Regras do Firestore restritivas | Atualize as regras conforme o arquivo |
| `auth/operation-not-allowed` | Email/Senha não habilitado | Ative no Console Firebase |
| `auth/weak-password` | Senha < 6 caracteres | Use senhas mais fortes |
| `auth/email-already-in-use` | Email já cadastrado | Use outro email |

### 6. **Debug Passo a Passo**

1. **Teste Básico**: `testBasicConnection()`
2. **Teste Auth**: `testAuthStatus()`
3. **Teste Registro**: `testCreateUser()`
4. **Teste Firestore**: `testFirestoreRead()` e `testFirestoreWrite()`

### 7. **Se Ainda Não Funcionar**

1. Verifique o console do navegador (F12)
2. Confirme se as chaves da API estão corretas
3. Teste com um email completamente novo
4. Confirme se o projeto Firebase está ativo

---

## 📋 Checklist Rápido

- [ ] Regras do Firestore atualizadas
- [ ] Email/Password habilitado no Authentication
- [ ] Projeto Firebase ativo
- [ ] Conexão com internet estável
- [ ] Console sem erros JavaScript

---

**💡 Dica**: Use o arquivo `firebase-diagnostico.html` para testar cada componente individualmente!
