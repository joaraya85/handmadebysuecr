const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./catalog.db');

app.use(cors());
app.use(bodyParser.json());

// --- Create tables if they don't exist ---
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    images TEXT, -- Comma-separated URLs
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);
});

// --- Category Endpoints ---

// Get all categories
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Add a new category
app.post('/api/categories', (req, res) => {
    db.run('INSERT INTO categories (name) VALUES (?)', [req.body.name], function (err) {
        if (err) return res.status(400).send(err.message);
        res.json({ id: this.lastID, name: req.body.name });
    });
});

// Delete a category
app.delete('/api/categories/:id', (req, res) => {
    db.run('DELETE FROM categories WHERE id=?', [req.params.id], function (err) {
        if (err) return res.status(400).send(err.message);
        res.json({ deleted: this.changes });
    });
});

// --- Product Endpoints ---

// Get all products (with category name)
app.get('/api/products', (req, res) => {
    db.all(
        `SELECT products.*, categories.name AS category 
     FROM products LEFT JOIN categories ON products.category_id = categories.id`,
        [],
        (err, rows) => {
            if (err) return res.status(500).send(err.message);
            // Parse images to array for frontend
            rows.forEach(r => { r.images = r.images ? r.images.split(',') : []; });
            res.json(rows);
        }
    );
});

// Add a new product
app.post('/api/products', (req, res) => {
    db.run(
        'INSERT INTO products (name, description, price, images, category_id) VALUES (?, ?, ?, ?, ?)',
        [
            req.body.name,
            req.body.description,
            req.body.price,
            req.body.images.join(','),
            req.body.category_id
        ],
        function (err) {
            if (err) return res.status(400).send(err.message);
            res.json({ id: this.lastID });
        }
    );
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id=?', [req.params.id], function (err) {
        if (err) return res.status(400).send(err.message);
        res.json({ deleted: this.changes });
    });
});

// Link product to category
app.put('/api/products/:id/category', (req, res) => {
    db.run('UPDATE products SET category_id=? WHERE id=?', [req.body.category_id, req.params.id], function (err) {
        if (err) return res.status(400).send(err.message);
        res.json({ updated: this.changes });
    });
});

// Unlink product from category (set category_id to NULL)
app.put('/api/products/:id/unlink', (req, res) => {
    db.run('UPDATE products SET category_id=NULL WHERE id=?', [req.params.id], function (err) {
        if (err) return res.status(400).send(err.message);
        res.json({ updated: this.changes });
    });
});

// --- Start the server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});