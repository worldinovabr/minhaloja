# Estrutura de Imagens - Minha Loja

## Organização das Pastas

### 📁 /images/produtos/
- **Finalidade**: Imagens dos produtos adicionados pelo administrador
- **Formato**: JPG, PNG, WebP
- **Tamanho recomendado**: 300x300px ou 400x400px
- **Naming**: Use nomes descritivos sem espaços (ex: camisa-polo-azul.jpg)

### 📁 /images/categorias/
- **Finalidade**: Imagens das categorias de produtos
- **Formato**: JPG, PNG, WebP
- **Tamanho recomendado**: 200x150px
- **Naming**: nome-da-categoria.jpg (ex: roupas.jpg, calcados.jpg)

### 📁 /images/banners/
- **Finalidade**: Banners promocionais e carrosséis
- **Formato**: JPG, PNG, WebP
- **Tamanho recomendado**: 1200x400px (desktop), 800x300px (mobile)
- **Naming**: banner-promocao-nome.jpg

## Como Usar

1. **Administradores**: Ao adicionar produtos, façam upload das imagens para a pasta correspondente
2. **URLs das imagens**: Use caminhos relativos como `images/produtos/produto-nome.jpg`
3. **Fallback**: O sistema usa placeholders automáticos caso a imagem não seja encontrada

## Dicas

- Mantenha as imagens otimizadas (não muito pesadas)
- Use formatos modernos como WebP quando possível
- Nomes de arquivo sem espaços ou caracteres especiais
- Mantenha consistência no tamanho das imagens por categoria
