# 📧 Como Configurar Emails de Verificação no Firebase

## ⚙️ Configuração Necessária no Console do Firebase

### 1. **Ativar Templates de Email**

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto: **minha-loja-a9998**
3. Vá em **Authentication** > **Templates**
4. Clique em **Verificação de email**
5. Configure o template:

```
Assunto: Confirme seu email - Minha Loja
```

```html
Corpo do Email:
Olá!

Para confirmar seu email e ativar sua conta na Minha Loja, clique no link abaixo:

%LINK%

Se você não criou uma conta conosco, ignore este email.

Obrigado,
Equipe Minha Loja
```

### 2. **Configurar Domínio Autorizado**

1. Ainda no Firebase Console
2. Vá em **Authentication** > **Settings**
3. Na seção **Authorized domains**, adicione:
   - `localhost` (para desenvolvimento)
   - Seu domínio real (para produção)

### 3. **Ativar Verificação Obrigatória (Opcional)**

Se quiser que todos os usuários verifiquem o email antes de usar o sistema:

1. Vá em **Authentication** > **Settings** 
2. Na seção **User actions**, ative:
   - ☑️ **Email verification required**

## 🔧 Funcionalidades Implementadas

### ✅ **Automático:**
- ✅ Email enviado automaticamente após cadastro
- ✅ Banner de notificação para emails não verificados
- ✅ Botão para reenviar email de verificação
- ✅ Verificação automática do status do email

### 📧 **Fluxo do Email:**
1. Usuário se cadastra
2. Email de verificação é enviado automaticamente
3. Usuário clica no link do email
4. Email é verificado no Firebase
5. Banner desaparece na próxima visita

## 🎨 **Interface do Usuário:**

### Banner de Verificação:
```
📧 Confirme seu email (usuario@email.com) para ativar todas as funcionalidades.
[Reenviar Email] [×]
```

### Mensagem de Cadastro:
```
✅ Cadastro realizado com sucesso! Bem-vindo, Nome! 📧 Verifique seu email para confirmar sua conta.
```

## 🐛 **Troubleshooting**

### Email não chegou?
1. Verifique spam/lixo eletrônico
2. Confirme se o domínio está autorizado
3. Use o botão "Reenviar Email"
4. Verifique se o template está configurado

### Banner não aparece?
1. Certifique-se de que o usuário está logado
2. Verifique se o email já foi verificado
3. Recarregue a página

### Erro ao reenviar?
1. Confirme se o usuário está logado
2. Verifique se o email já foi verificado
3. Aguarde alguns minutos entre envios

## 📋 **Checklist de Configuração**

- [ ] Template de email configurado
- [ ] Domínios autorizados adicionados
- [ ] Email/Password habilitado
- [ ] Regras do Firestore configuradas
- [ ] Teste de envio realizado

---

**🎉 Pronto!** Agora seus usuários receberão emails de verificação automaticamente!
