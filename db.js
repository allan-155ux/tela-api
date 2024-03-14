const sqlite3 = require('sqlite3').verbose();

// Criar conexão com o banco de dados SQLite
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        subtitle TEXT,
        description TEXT,
        price REAL,
        lastprice REAL,
        tag TEXT,
        url TEXT
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar a tabela:', err.message);
        } else {
            console.log('Tabela criada com sucesso.');
        }
    });
});
module.exports = db