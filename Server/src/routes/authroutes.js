import express from 'express';
import db from '../db/db.js'; // Importa tu conexión de base de datos desde otro archivo
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();


router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM login WHERE email = ?';
    const values = [email];
    db.query(sql, values, (error, data) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (data.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        const user = data[0];
        if (password !== user.password) { 
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'secreto', { expiresIn: '1h' });

        const insertTokenQuery = 'INSERT INTO tokens (user_id, token) VALUES (?, ?)';
        const tokenValues = [user.id, token];
        db.query(insertTokenQuery, tokenValues, (error, result) => {
            if (error) {
                console.error('Error al guardar el token en la base de datos:', error);
                return res.status(500).json({ error: 'Error en el servidor' });
            }     
            // Establecer el token como un encabezado en la respuesta
            res.set('Authorization', `Bearer ${token}`);
            return res.json({ token });
        });
    });
});


const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.user = decoded;
        next();
    });
};


router.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Ruta protegida', userId: req.user.id });
});


router.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Verificar si el correo electrónico ya existe en la base de datos
    const checkEmailQuery = 'SELECT COUNT(*) AS count FROM login WHERE email = ?';
    db.query(checkEmailQuery, [email], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        const emailExists = results[0].count > 0;
        if (emailExists) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Si el correo electrónico no existe, proceder con el registro del usuario
        const insertUserQuery = 'INSERT INTO login (email, password, role) VALUES (?, ?, ?)';
        const values = [email, password, 'usuario'];
        db.query(insertUserQuery, values, (error, result) => {
            if (error) {
                console.error('Error en la consulta SQL:', error);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            return res.status(201).json({ message: 'Usuario registrado correctamente' });
        });
    });
});



const isAdmin = (req, res, next) => {

    if (req.user && req.user.role === 'admin') {
      
        next();
    } else {

        return res.status(403).json({ error: 'Acceso no autorizado' });
    }
};

// Ruta protegida que solo puede ser accedida por administradores
router.get('/admin-only', isAdmin, (req, res) => {

    res.json({ message: 'Esta es una ruta solo para administradores' });
});
router.get('/user', verifyToken, (req, res) => {
    const userId = req.user.id;

    const sql = 'SELECT * FROM login WHERE id = ?';
    const values = [userId];
    db.query(sql, values, (error, data) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Devolver los datos del usuario encontrado
        const userData = data[0];
        return res.json(userData);
    });
});


router.get('/users/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    
    const sql = 'SELECT * FROM login WHERE id = ?';
    const values = [userId];
    db.query(sql, values, (error, data) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Devolver los datos del usuario encontrado
        const userData = data[0];
        return res.json(userData);
    });
});


export default router;