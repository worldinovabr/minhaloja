const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const bodyParser = require('require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Inicializa o Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Rotas de produtos
app.get('/api/produtos', async (req, res) => {
  const snapshot = await db.collection('produtos').get();
  const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.send(produtos);
});

app.post('/api/produtos', async (req, res) => {
  const { nome, preco, imagem } = req.body;
  const docRef = await db.collection('produtos').add({ nome, preco, imagem });
  res.send({ id: docRef.id, nome, preco, imagem });
});

app.delete('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('produtos').doc(id).delete();
  res.send({ message: 'Produto deletado com sucesso.' });
});

// Rotas de pedidos
app.post('/api/pedidos', async (req, res) => {
  const pedido = req.body;
  const docRef = await db.collection('pedidos').add(pedido);
  res.send({ message: 'Pedido recebido!', id: docRef.id });
});

app.get('/api/pedidos', async (req, res) => {
  const snapshot = await db.collection('pedidos').orderBy('data', 'desc').get();
  const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.send(pedidos);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});