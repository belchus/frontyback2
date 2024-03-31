import express from 'express';
import db from '../db/db.js'; // Importa tu conexión de base de datos desde otro archivo

const router = express.Router();

router.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (error, results, fields) => {
      if (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
        return;
      }
      console.log('Datos recibidos del frontend:', results); // Agrega console.log para ver los datos recibidos del frontend
      res.json(results);
    });
  });

  router.get('/productos/:id', (req, res) => {
    const productId = req.params.id;
    const sql = `SELECT * FROM products WHERE id = ?`; // Consulta SQL para obtener un producto por su ID
    db.query(sql, [productId], (error, results, fields) => {
      if (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
        return;
      }
      if (results.length === 0) {
        console.log('El producto no fue encontrado:', productId);
        res.status(404).json({ error: 'El producto no fue encontrado' });
        return;
      }
      const product = results[0]; // Obtener el primer producto de los resultados (asumiendo que el ID es único)
      console.log('Producto encontrado:', product);
      res.json(product);
    });
});

router.delete('/productos/:id', (req, res) => {
  const productId = req.params.id;

  const sql = 'DELETE FROM products WHERE id = ?';
  const values = [productId];

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error al eliminar el producto:', error);
      res.status(500).json({ error: 'Error al eliminar el producto' });
      return;
    }

    if (results.affectedRows === 0) {
      // Si no se encontró ningún producto con el ID proporcionado
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    console.log('Producto eliminado correctamente:', productId);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  });
});

router.put('/productos/:id', (req, res) => {
  const productId = req.params.id;
  const { nombre, imagen, cantidad, descripcion, precio, category } = req.body;

  const sql = 'UPDATE products SET nombre = ?, imagen = ?, cantidad = ?, descripcion = ?, precio = ?, category = ? WHERE id = ?';
  const values = [nombre, imagen, cantidad, descripcion, precio, category, productId];

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error al editar el producto:', error);
      res.status(500).json({ error: 'Error al editar el producto' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    console.log('Producto editado correctamente:', productId);
    res.status(200).json({ message: 'Producto editado correctamente' });
  });
});



router.post('/productos', (req, res) => {
  const { nombre, imagen, cantidad, descripcion, precio, category } = req.body; // Recibir los datos del nuevo producto desde el cuerpo de la solicitud


  const sql = 'INSERT INTO products (nombre, imagen, cantidad, descripcion, precio, category) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [nombre, imagen, cantidad, descripcion, precio, category];

  db.query(sql, values, (error, results) => {
      if (error) {
          console.error('Error al agregar el producto:', error);
          res.status(500).json({ error: 'Error al agregar el producto' });
          return;
      }

      console.log('Producto agregado correctamente:', { id: results.insertId, nombre, imagen, cantidad, descripcion, precio, category });
      res.status(201).json({ message: 'Producto agregado correctamente', productId: results.insertId });
  });
});

router.get('/productos/categoria/:categoria', (req, res) => {
  const categoria = req.params.categoria;
  const sql = 'SELECT * FROM products WHERE category = ?';
  db.query(sql, [categoria], (error, results, fields) => {
    if (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({ error: 'Error al obtener productos por categoría' });
      return;
    }
    console.log(`Productos de la categoría "${categoria}" recibidos del frontend:`, results);
    res.json(results);
  });
});
export default router;
