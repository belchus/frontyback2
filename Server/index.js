import express, { response } from 'express';
import cors from 'cors';
import { config as configDotenv } from 'dotenv';
import mercadopago from 'mercadopago';
import authenticateToken from './src/middleware/middleware.js';
import authRoutes from './src/routes/authroutes.js';
import products from './src/routes/products.js';
import cart from './src/routes/cart.js';

const server = express();

server.use(express.json());

mercadopago.configure({
    access_token: 'TEST-6544339040733152-031522-4d7eb2feb9ef209e5b16692cae46e27b-191929307'
  });
server.get("/",(req,res) => {
    res.send("Servidor up")
});
server.use(cors({
    origin: 'http://localhost:3000', // Cambia esto por el origen de tu frontend
    credentials: true // Permite el intercambio de cookies entre dominios
}));



  
server.listen(4000,() => console.log('servidor levantado') );
server.post('/Mercado_pago', async (req, res) => {
    console.log(req.body.items[0]);
    try {
        // Construir el cuerpo de la preferencia con los datos recibidos
        const body = {
            items: [{
                title: req.body.items[0].nombre,
                quantity: req.body.items[0].cantidad,
                unit_price: req.body.items[0].precio,
                currency_id: "ARS",
            }],
            back_urls: {
                success: "http://localhost:4000/confirmation",
                failure: "URL_FALLA",
                pending: "URL_PENDIENTE",
            },
            auto_return: "approved",
            notification_url : "http://localhost:4000/confirmation"
        };
 
        mercadopago.preferences.create(body)
        
            .then(response => {
                const initPoint = response.body.init_point;
                res.status(200).send({ initPoint });
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({ error: "ERROR AL CREAR LA PREFERENCIA" });
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR AL PROCESAR LA SOLICITUD" });
    }
});

server.post('/confirmation', async function (req,res){
    const payment = req.query.id
    try {
        const response = await fetch ('https://api.mercadopago.com/v1/payments/${payment}',{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer ${client.accessToken}'
            }
        });
        if (response.ok){
            const data =await response.json();
            console.log(data)
        }
        res.sendStatus(data)
    } catch (error) {
        console.error('ERROR', error);
        res.sendStatus(500)
    }    
})


server.use('/auth', authRoutes);
server.use('/', products); 
server.use('/cart',authenticateToken, cart); // Usa las rutas de autenticación en /auth

