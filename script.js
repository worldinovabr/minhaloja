const produtos = [
  { id: 1, nome: 'Camisa Polo', preco: 89.99, imagem: 'img/camisa1.jpg' },
  { id: 2, nome: 'Vestido Floral', preco: 149.99, imagem: 'img/vestido1.jpg' },
  { id: 3, nome: 'Calça Jeans', preco: 119.99, imagem: 'img/calca1.jpg' }
];

const carrinho = [];

function renderizarProdutos() {
  const lista = document.getElementById('product-list');
  lista.innerHTML = '';
  produtos.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${prod.imagem}" alt="${prod.nome}" />
      <h3>${prod.nome}</h3>
      <p>R$ ${prod.preco.toFixed(2)}</p>
      <button onclick="adicionarAoCarrinho(${prod.id})">Adicionar</button>
    `;
    lista.appendChild(card);
  });
}

function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  carrinho.push(produto);
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const lista = document.getElementById('cart-list');
  const totalSpan = document.getElementById('total');
  lista.innerHTML = '';
  let total = 0;
  carrinho.forEach(prod => {
    const item = document.createElement('li');
    item.textContent = `${prod.nome} - R$ ${prod.preco.toFixed(2)}`;
    lista.appendChild(item);
    total += prod.preco;
  });
  totalSpan.textContent = total.toFixed(2);
}

function finalizarCompra() {
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }
  alert('Compra finalizada com sucesso!');
  carrinho.length = 0;
  atualizarCarrinho();
}

document.getElementById('ano').textContent = new Date().getFullYear();
renderizarProdutos();