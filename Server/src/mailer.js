const nodemailer = require('nodemailer');
const uuid = require('uuid');
const db = require('./db/db');

// Configuración de nodemailer (configura tus propias credenciales)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'arenabelu@gmail.com',
    pass: 'tu_contraseña'
  }
});

// Procesar el checkout
exports.processCheckout = async (req, res) => {
  const order = req.body;

  try {
    // Generar número de orden único
    const orderNumber = uuid.v4();

    // Guardar el pedido en la base de datos
    const sql = 'INSERT INTO orders (order_number, items, total) VALUES (?, ?, ?)';
    db.query(sql, [orderNumber, JSON.stringify(order.items), order.total], async (err, result) => {
      if (err) {
        console.error('Error al guardar el pedido:', err);
        res.status(500).json({ message: 'Error al procesar el pedido' });
        return;
      }

      // Enviar correo electrónico al cliente
      const mailOptions = {
        from: 'tu_correo@gmail.com',
        to: 'correo_cliente@example.com',
        subject: 'Tenes un nuevo pedido',
        text: `Numero de orden :${orderNumber}.`
      };

      await transporter.sendMail(mailOptions);
      res.json({ orderNumber: orderNumber });
    });
  } catch (error) {
    console.error('Error en el proceso de checkout:', error);
    res.status(500).json({ message: 'Error en el proceso de checkout' });
  }
};
