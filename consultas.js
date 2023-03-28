const { Pool } = require('pg')
 
const host = process.env.DB_HOST || "localhost";
const user = process.env.DB_USER || "node";
const password = process.env.DB_PASSWORD || "123456"
const database = process.env.DB_DATABASE|| "blog_peliculas"

const pool = new Pool({
  host,
  user,
  password,
  database,
  max: 5,
  port: 5432,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
})


//TRAER PUBLICACIONES
const getPublicaciones = async () => {
        let consulta = "SELECT titulo, contenido, imagen, fecha FROM publicaciones order by fecha"
        let resultado = await pool.query(consulta);
        return resultado.rows;
}

const getCategorias= async () => {
    let consulta = "SELECT id, nombre FROM categorias order by nombre ASC"
    let resultado = await pool.query(consulta);
    return resultado.rows;
}

const getUsuarioByEmailAndPassword = async (email, password) => {
    let consulta = "SELECT id, nombre, email FROM usuarios WHERE email = $1 AND password = $2"
    let resultado = await pool.query(consulta, [email, password]);
    return resultado.rows[0];
}

getCategorias


module.exports = {
    getPublicaciones,
    getUsuarioByEmailAndPassword,
    getCategorias
}