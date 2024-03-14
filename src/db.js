const { Pool } = require('pg');

// Configurações de conexão com o banco de dados PostgreSQL no Render
const pool = new Pool({
  user: 'backend_pizza_api_user',
  host: 'dpg-cnpjdm7109ks73euovhg-a.oregon-postgres.render.com',
  database: 'backend_pizza_api', // Nome do seu banco de dados
  password: 'j7XkzluFBnSOE7eYrroahB5XEr7Pd6S2',
  port: 5432, // Porta padrão do PostgreSQL
  ssl: {
    rejectUnauthorized: false, // Necessário para conexões com SSL no Render
  },
});
  
pool.query(`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    price REAL,
    lastprice REAL,
    tag TEXT,
    url TEXT
)`, (err, res) => {
  if (err) {
    console.error('Erro ao criar a tabela:', err);
  } else {
    console.log('Tabela criada com sucesso.');
  }
});


module.exports = pool