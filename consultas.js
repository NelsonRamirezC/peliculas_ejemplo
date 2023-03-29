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
        let consulta = `
                        select p.id, p.titulo, p.contenido, p.fecha, p.imagen, u.nombre as autor from publicaciones p
                        join usuarios u
                        on p.id_usuario = u.id
        `
        let resultado = await pool.query(consulta);
        return resultado.rows;
}

const getPublicacioById = async (id) => {
    let consulta = `
    select p.id, p.titulo, p.contenido, p.fecha, p.imagen, u.nombre as usuario, ct.nombre as categoria from publicaciones p
    join categorias ct
    on p.id_categoria = ct.id
    join usuarios u
    on p.id_usuario = u.id
    where p.id = $1;
    `
    let resultado = await pool.query(consulta, [id]);
    return resultado.rows[0];
}

const getCategorias= async () => {
    let consulta = "SELECT id, nombre FROM categorias order by nombre ASC"
    let resultado = await pool.query(consulta);
    return resultado.rows;
}

const getCategoriaByName = async (categoria) => {
    let consulta = `
    select p.id, p.titulo, p.contenido, p.fecha, p.imagen, u.nombre as autor, ct.nombre as categoria from publicaciones p
    join categorias ct
    on p.id_categoria = ct.id
    join usuarios u
    on p.id_usuario = u.id
    where ct.nombre = $1
    order by fecha asc
    `

    let resultado = await pool.query(consulta, [categoria]);
    return resultado.rows;
}

const getUsuarioByEmailAndPassword = async (email, password) => {
    let consulta = "SELECT id, nombre, email FROM usuarios WHERE email = $1 AND password = $2"
    let resultado = await pool.query(consulta, [email, password]);
    return resultado.rows[0];
}

const addPublicacion = async (titulo, contenido, id_categoria, id_usuario, imagen) => {
    let query = `INSERT INTO publicaciones(titulo, contenido, fecha, id_categoria, id_usuario, imagen)
                VALUES($1, $2, NOW(), $3, $4, $5) RETURNING *
    `
    let resultado = await pool.query(query, [titulo, contenido, id_categoria, id_usuario, imagen]);
    return resultado.rows[0];
}

const getComentarios = async(id) => {
    let consulta = "SELECT * FROM comentarios where id_publicacion = $1"
    let resultado = await pool.query(consulta, [id]);
    return resultado.rows;
}

module.exports = {
    getPublicaciones,
    getUsuarioByEmailAndPassword,
    getCategorias,
    addPublicacion,
    getCategoriaByName,
    getPublicacioById,
    getComentarios
}