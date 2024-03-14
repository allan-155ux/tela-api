const express = require('express');
const db = require('./db.js')
const app = express();
const cors = require('cors')
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("Beckend Pizza App"));

// Rota para retornar um produto com base no ID
app.get('/product/:id', (req, res) => {
    const productId = req.params.id;

    db.get(`SELECT * FROM products WHERE id = ?`, [productId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.json(row);
    });
});

// Rota para retornar produtos com base na tag
app.get('/products/tag/:tag', (req, res) => {
    const tag = req.params.tag;

    db.all(`SELECT * FROM products WHERE tag = ?`, [tag], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// Rota para retornar todos os produtos
app.get('/products', (req, res) => {
    db.all(`SELECT * FROM products`, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// Adicionar produto
app.post('/product', (req, res) => {
    const { title, subtitle, description, price, lastprice, tag, url } = req.body;

    db.run(`INSERT INTO products (title, subtitle, description, price, lastprice, tag, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [title, subtitle, description, price, lastprice, tag, url], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: 'Produto adicionado com sucesso!',
            productId: this.lastID
        });
    });
});

// Atualizar produto
app.put('/product/:id', (req, res) => {
    const { image, title, subtitle, description, price, lastprice, tag, url } = req.body;
    const productId = req.params.id;

    db.run(`UPDATE products SET image=?, title=?, subtitle=?, description=?, price=?, lastprice=?, tag=?, url=? WHERE id=?`, [image, title, subtitle, description, price, lastprice, tag, url, productId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: 'Produto atualizado com sucesso!',
            rowsAffected: this.changes
        });
    });
});

// Excluir produto
app.delete('/product/:id', (req, res) => {
    const productId = req.params.id;

    db.run(`DELETE FROM products WHERE id=?`, [productId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: 'Produto excluído com sucesso!',
            rowsAffected: this.changes
        });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
