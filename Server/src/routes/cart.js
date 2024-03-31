import express from 'express';
import db from '../db/db.js';
import authenticateToken from '../middleware/middleware.js';
const router = express.Router();

// Ruta para guardar el carrito de un usuario
router.post('/agregar-al-carrito', (req, res) => {
    console.log(req.user);
 const userId = req.body.id; 
    const { productId, cantidad } = req.body;
    // Cosultar el carrito actual del usuario
    db.query('SELECT * FROM carts WHERE user_id = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error al buscar el carrito del usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }

        let carritoExistente = results.length > 0 ? results[0] : null;
        let productosEnCarrito = carritoExistente ? JSON.parse(carritoExistente.productos) : [];

        // Verificar si el producto ya está en el carrito
        let productoExistente = productosEnCarrito.find(producto => producto.id === productId);

        if (productoExistente) {
            // Si el producto ya está en el carrito, actualiza la cantidad
            productoExistente.cantidad += cantidad;
        } else {
            // Si el producto no está en el carrito, agregarlo
            productosEnCarrito.push({ id: productId, cantidad });
        }

        // Actualizar el carrito en la base de datos
        const productosJSON = JSON.stringify(productosEnCarrito);
        if (carritoExistente) {
            db.query('UPDATE carts SET products = ? WHERE user_id = ?', [productosJSON, userId], (error, _) => {
                if (error) {
                    console.error('Error al actualizar el carrito del usuario:', error);
                    res.status(500).json({ error: 'Error interno del servidor' });
                    return;
                }
                res.status(200).json({ message: 'Producto agregado al carrito' });
            });
        } else {
            db.query('INSERT INTO carts (user_id, products) VALUES (?, ?)', [userId, productosJSON], (error, _) => {
                if (error) {
                    console.error('Error al agregar el producto al carrito del usuario:', error);
                    res.status(500).json({ error: 'Error interno del servidor' });
                    return;
                }
                res.status(201).json({ message: 'Producto agregado al carrito' });
            });
        }
    });
});


export default router;
