const express = require('express');
const pool = require('../../src/db.js')
const app = express();
const cors = require('cors')
const port = process.env.PORT || 3001;
const { SpeedInsights } = require("@vercel/speed-insights/next")

app.use(express.json());

// Configurando o CORS com opções personalizadas
app.use(cors());


app.get("/", (req, res) => res.send("Beckend Pizza App"));

// Rota para criar pagamento cartão
app.post('/create-payment-card', async (req, res) => {
    try {
        const { customerId, value, description, cardNumber, cardExpirationMonth, cardExpirationYear, cardCvv } = req.body;

        const response = await axios.post('https://www.asaas.com/api/v3/payments', {
            customer: customerId,
            billingType: 'CREDIT_CARD',
            value,
            description,
            creditCard: {
                number: cardNumber,
                expMonth: cardExpirationMonth,
                expYear: cardExpirationYear,
                cvc: cardCvv
            }
        }, {
            headers: {
                'access_token': 'SUA_CHAVE_DE_ACESSO_DA_API_DA_ASASS'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Erro ao criar pagamento com cartão de crédito:', error.response.data);
        res.status(500).json({ error: 'Erro ao criar pagamento com cartão de crédito' });
    }
});

// Rota para criar um novo cliente na Asaas
app.post('/clients', async (req, res) => {
    try {
        const { name, email, cpfCnpj, postalCode, address, addressNumber, complement, province, phone } = req.body;

        const response = await axios.post('https://www.asaas.com/api/v3/customers', {
            name,
            email,
            cpfCnpj,
            postalCode,
            address,
            addressNumber,
            complement,
            province,
            phone
        }, {
            headers: {
                'access_token': 'SUA_CHAVE_DE_ACESSO_DA_API_DA_ASASS'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Erro ao criar cliente:', error.response.data);
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});

// Rota para retornar informações de um produto com base no ID
app.get('/product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1`, [productId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para retornar produtos com base na tag
app.get('/products/tag/:tag', async (req, res) => {
    const tag = req.params.tag;

    try {
        const { rows } = await pool.query(`SELECT * FROM products WHERE tag = $1`, [tag]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para retornar todos os produtos
app.get('/products', async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM products`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para criar varios produtos
app.post('/products', async (req, res) => {
    const products = req.body; // Array de produtos

    try {
        const insertedProductIds = [];

        // Iterar sobre cada produto no array
        for (const product of products) {
            const { title, subtitle, description, price, lastprice, tag, url } = product;

            // Inserir o produto no banco de dados
            const result = await pool.query(`
                INSERT INTO products (title, subtitle, description, price, lastprice, tag, url)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [title, subtitle, description, price, lastprice, tag, url]);

            // Armazenar o ID do produto inserido
            insertedProductIds.push(result.rows[0].id);
        }

        res.json({
            message: 'Produtos adicionados com sucesso!',
            productIds: insertedProductIds
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Adicionar produto
app.post('/product', async (req, res) => {
    const { title, subtitle, description, price, lastprice, tag, url } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO products (title, subtitle, description, price, lastprice, tag, url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [title, subtitle, description, price, lastprice, tag, url]);

        res.json({
            message: 'Produto adicionado com sucesso!',
            productId: result.rows[0].id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar produto
app.put('/product/:id', async (req, res) => {
    const { title, subtitle, description, price, lastprice, tag, url } = req.body;
    const productId = req.params.id;

    try {
        const result = await pool.query(`
            UPDATE products 
            SET title=$1, subtitle=$2, description=$3, price=$4, lastprice=$5, tag=$6, url=$7 
            WHERE id=$8
        `, [title, subtitle, description, price, lastprice, tag, url, productId]);

        res.json({
            message: 'Produto atualizado com sucesso!',
            rowsAffected: result.rowCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Excluir produto
app.delete('/product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const result = await pool.query(`DELETE FROM products WHERE id=$1`, [productId]);
        res.json({
            message: 'Produto excluído com sucesso!',
            rowsAffected: result.rowCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
