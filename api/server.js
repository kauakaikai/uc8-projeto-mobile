require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const porta = Number(process.env.PORT || 3000);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida. Configure api/.env antes de iniciar a API.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json({ limit: '100kb' }));

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const numeroId = (valor) => {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
};

const texto = (valor) => typeof valor === 'string' ? valor.trim() : '';

function validarCliente(dados) {
  const nome = texto(dados.nome);
  const telefone = texto(dados.telefone);
  const email = texto(dados.email);
  if (!nome || !telefone || !email) {
    return { erro: 'Preencha nome, telefone e e-mail do tutor.' };
  }
  return { dados: { nome, telefone, email } };
}

function validarPet(dados) {
  const nome = texto(dados.nome);
  const especie = texto(dados.especie);
  const raca = texto(dados.raca);
  const id_cliente = numeroId(dados.id_cliente);
  if (!nome || !especie || !raca || !id_cliente) {
    return { erro: 'Preencha nome, espécie, raça e selecione um tutor válido.' };
  }
  return { dados: { nome, especie, raca, id_cliente } };
}

function validarConsulta(dados) {
  const id_pet = numeroId(dados.id_pet);
  const data = texto(dados.data);
  const hora = texto(dados.hora);
  const descricao_sintomas = texto(dados.descricao_sintomas);
  const valor = Number(dados.valor);
  if (!id_pet || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora) || !descricao_sintomas || !Number.isFinite(valor) || valor < 0) {
    return { erro: 'Preencha pet, data, hora, descrição e um valor igual ou maior que zero.' };
  }
  return { dados: { id_pet, data, hora, descricao_sintomas, valor } };
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', servico: 'PetCare API' });
}));

// Tutores
app.get('/api/clientes', asyncRoute(async (_req, res) => {
  const resultado = await pool.query('SELECT id, nome, telefone, email FROM clientes ORDER BY nome');
  res.json(resultado.rows);
}));

app.post('/api/clientes', asyncRoute(async (req, res) => {
  const validacao = validarCliente(req.body || {});
  if (validacao.erro) return res.status(400).json({ message: validacao.erro });
  const { nome, telefone, email } = validacao.dados;
  const resultado = await pool.query(
    'INSERT INTO clientes (nome, telefone, email) VALUES ($1, $2, $3) RETURNING id, nome, telefone, email',
    [nome, telefone, email],
  );
  res.status(201).json(resultado.rows[0]);
}));

app.put('/api/clientes/:id', asyncRoute(async (req, res) => {
  const id = numeroId(req.params.id);
  const validacao = validarCliente(req.body || {});
  if (!id) return res.status(400).json({ message: 'Identificador de tutor inválido.' });
  if (validacao.erro) return res.status(400).json({ message: validacao.erro });
  const { nome, telefone, email } = validacao.dados;
  const resultado = await pool.query(
    'UPDATE clientes SET nome = $1, telefone = $2, email = $3 WHERE id = $4 RETURNING id, nome, telefone, email',
    [nome, telefone, email, id],
  );
  if (!resultado.rowCount) return res.status(404).json({ message: 'Tutor não encontrado.' });
  res.json(resultado.rows[0]);
}));

app.delete('/api/clientes/:id', asyncRoute(async (req, res) => {
  const id = numeroId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador de tutor inválido.' });
  const pets = await pool.query('SELECT id FROM pets WHERE id_cliente = $1 LIMIT 1', [id]);
  if (pets.rowCount) return res.status(409).json({ message: 'Não é possível excluir um tutor com pets cadastrados.' });
  const resultado = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
  if (!resultado.rowCount) return res.status(404).json({ message: 'Tutor não encontrado.' });
  res.status(204).end();
}));

// Pets
app.get('/api/pets/buscar', asyncRoute(async (req, res) => {
  const termoBusca = texto(req.query.termo);
  if (termoBusca.length < 2) return res.status(400).json({ message: 'Digite pelo menos 2 caracteres para buscar.' });
  const resultado = await pool.query(
    `SELECT pets.id, pets.nome, pets.especie, pets.raca, pets.id_cliente,
            clientes.nome AS nome_cliente
       FROM pets
       LEFT JOIN clientes ON clientes.id = pets.id_cliente
      WHERE pets.nome ILIKE $1 OR clientes.nome ILIKE $1
      ORDER BY pets.nome`,
    [`%${termoBusca}%`],
  );
  res.json(resultado.rows);
}));

app.get('/api/pets', asyncRoute(async (req, res) => {
  const idCliente = req.query.cliente_id === undefined ? null : numeroId(req.query.cliente_id);
  if (req.query.cliente_id !== undefined && !idCliente) return res.status(400).json({ message: 'Tutor inválido.' });
  const sql = idCliente
    ? 'SELECT id, nome, especie, raca, id_cliente FROM pets WHERE id_cliente = $1 ORDER BY nome'
    : 'SELECT id, nome, especie, raca, id_cliente FROM pets ORDER BY nome';
  const resultado = await pool.query(sql, idCliente ? [idCliente] : []);
  res.json(resultado.rows);
}));

app.post('/api/pets', asyncRoute(async (req, res) => {
  const validacao = validarPet(req.body || {});
  if (validacao.erro) return res.status(400).json({ message: validacao.erro });
  const { nome, especie, raca, id_cliente } = validacao.dados;
  const resultado = await pool.query(
    'INSERT INTO pets (nome, especie, raca, id_cliente) VALUES ($1, $2, $3, $4) RETURNING id, nome, especie, raca, id_cliente',
    [nome, especie, raca, id_cliente],
  );
  res.status(201).json(resultado.rows[0]);
}));

app.put('/api/pets/:id', asyncRoute(async (req, res) => {
  const id = numeroId(req.params.id);
  const validacao = validarPet(req.body || {});
  if (!id) return res.status(400).json({ message: 'Identificador de pet inválido.' });
  if (validacao.erro) return res.status(400).json({ message: validacao.erro });
  const { nome, especie, raca, id_cliente } = validacao.dados;
  const resultado = await pool.query(
    'UPDATE pets SET nome = $1, especie = $2, raca = $3, id_cliente = $4 WHERE id = $5 RETURNING id, nome, especie, raca, id_cliente',
    [nome, especie, raca, id_cliente, id],
  );
  if (!resultado.rowCount) return res.status(404).json({ message: 'Pet não encontrado.' });
  res.json(resultado.rows[0]);
}));

app.delete('/api/pets/:id', asyncRoute(async (req, res) => {
  const id = numeroId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador de pet inválido.' });
  const consultas = await pool.query('SELECT id FROM consultas WHERE id_pet = $1 LIMIT 1', [id]);
  if (consultas.rowCount) return res.status(409).json({ message: 'Não é possível excluir um pet com consultas registradas.' });
  const resultado = await pool.query('DELETE FROM pets WHERE id = $1', [id]);
  if (!resultado.rowCount) return res.status(404).json({ message: 'Pet não encontrado.' });
  res.status(204).end();
}));

// Consultas
app.get('/api/consultas', asyncRoute(async (req, res) => {
  const idPet = numeroId(req.query.pet_id);
  if (!idPet) return res.status(400).json({ message: 'Selecione um pet para consultar o histórico.' });
  const resultado = await pool.query(
    `SELECT id, id_pet, to_char(data, 'YYYY-MM-DD') AS data,
            to_char(hora, 'HH24:MI') AS hora, descricao_sintomas, valor
       FROM consultas WHERE id_pet = $1 ORDER BY data DESC, hora DESC`,
    [idPet],
  );
  res.json(resultado.rows.map((linha) => ({ ...linha, valor: Number(linha.valor) })));
}));

app.post('/api/consultas', asyncRoute(async (req, res) => {
  const validacao = validarConsulta(req.body || {});
  if (validacao.erro) return res.status(400).json({ message: validacao.erro });
  const { id_pet, data, hora, descricao_sintomas, valor } = validacao.dados;
  const resultado = await pool.query(
    `INSERT INTO consultas (id_pet, data, hora, descricao_sintomas, valor)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, id_pet, to_char(data, 'YYYY-MM-DD') AS data,
               to_char(hora, 'HH24:MI') AS hora, descricao_sintomas, valor`,
    [id_pet, data, hora, descricao_sintomas, valor],
  );
  res.status(201).json({ ...resultado.rows[0], valor: Number(resultado.rows[0].valor) });
}));

app.put('/api/consultas/:id', asyncRoute(async (req, res) => {
  const id = numeroId(req.params.id);
  const validacao = validarConsulta(req.body || {});
  if (!id) return res.status(400).json({ message: 'Identificador de consulta inválido.' });
  if (validacao.erro) return res.status(400).json({ message: validacao.erro });
  const { id_pet, data, hora, descricao_sintomas, valor } = validacao.dados;
  const resultado = await pool.query(
    `UPDATE consultas SET id_pet = $1, data = $2, hora = $3, descricao_sintomas = $4, valor = $5
      WHERE id = $6
      RETURNING id, id_pet, to_char(data, 'YYYY-MM-DD') AS data,
                to_char(hora, 'HH24:MI') AS hora, descricao_sintomas, valor`,
    [id_pet, data, hora, descricao_sintomas, valor, id],
  );
  if (!resultado.rowCount) return res.status(404).json({ message: 'Consulta não encontrada.' });
  res.json({ ...resultado.rows[0], valor: Number(resultado.rows[0].valor) });
}));

app.delete('/api/consultas/:id', asyncRoute(async (req, res) => {
  const id = numeroId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Identificador de consulta inválido.' });
  const resultado = await pool.query('DELETE FROM consultas WHERE id = $1', [id]);
  if (!resultado.rowCount) return res.status(404).json({ message: 'Consulta não encontrada.' });
  res.status(204).end();
}));

app.use((erro, _req, res, _next) => {
  console.error('[PetCare API]', erro);
  if (erro && erro.code === '23503') {
    return res.status(409).json({ message: 'Não foi possível concluir: existem registros relacionados a este item.' });
  }
  if (erro && erro.code === '23505') {
    return res.status(409).json({ message: 'Já existe um registro com esses dados.' });
  }
  res.status(500).json({ message: 'Erro interno da API PetCare. Confira o terminal do servidor.' });
});

const servidor = app.listen(porta, '0.0.0.0', () => {
  console.log(`PetCare API disponível na porta ${porta}`);
  console.log(`Teste: http://localhost:${porta}/api/health`);
});

async function encerrar() {
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
