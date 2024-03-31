import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, 'hola1234', { expiresIn: '1h' }); 
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization; 

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, 'hola1234'); 
    req.user = decoded; 
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export { generateToken, verifyToken };
