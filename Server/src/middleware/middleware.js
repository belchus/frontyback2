// middleware de autenticación
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización no proporcionado' });
  }

  jwt.verify(token, 'tu_secreto_jwt', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token de autorización inválido' });
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;
