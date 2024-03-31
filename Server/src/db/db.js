import mysql from 'mysql'
// Inicialización de las variables de entorno


const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password : '',
    database :'crud'
})

export default db;