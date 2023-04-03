const express = require('express');
const {create}= require('express-handlebars');
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const {getPublicaciones, getUsuarioByEmailAndPassword, getCategorias, addPublicacion, getCategoriaByName, getPublicacionById, getComentarios, addComentario, getCantidadComentarios, addUsuario, darLike, getLike, cantidadLikeAndDislike } = require('./consultas.js')
const { verificarToken } = require("./middlewares/jwt.js")
const { upload } = require('./middlewares/upload.js')
const cors = require("cors")
const fs = require('fs');
const apicache = require('apicache')
const morgan = require("morgan");


const app = express();

const SECRETO = process.env.SECRETO || "123456";


//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/public', express.static('public'));
app.use(cors());
app.use(morgan('tiny'));
let cache = apicache.middleware


let limiteMb = 2;
app.use(fileUpload({
    limits: { fileSize: limiteMb* 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: `Usted ha superado el límite permitido (${limiteMb})`
}));



//configuración handlebars

const hbs = create({
	partialsDir: [
		"views/partials/",
	],
    helpers: {
        isLike(like){
                if(like == null) return '<i  onclick="darLike(this)" class="fa fa-thumbs-up null"></i>'
                if(like == true) return '<i onclick="darLike(this)" class="fa fa-thumbs-up like"></i>'
                if(like == false) return '<i onclick="darLike(this)" class="fa fa-thumbs-down dislike"></i>'
        }
    }
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

//fin configuración handlebars


//RUTAS DE VISTA
app.get("/", cache('10 seconds'), async (req, res) => {
    try {
        
        let {order} = req.query;
        if(order){
            let opciones = ["asc", "desc"].includes(order.toLowerCase());
            if(!opciones) order = "asc";
            
        }else{
           order = "asc"; 
        }
        let publicaciones = await getPublicaciones(order);
        publicaciones = publicaciones.map(publicacion => {
            publicacion.fecha = moment(publicacion.fecha).format('DD-MM-YYYY')
            return publicacion
        })
        res.render("home", {
            publicaciones
        })
    } catch (error) {
        console.log(error)
        res.render("home", {
            error: "No se pudieron cargas las publicaciones"
        })
    }
    
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/registro", (req, res) => {
    res.render("registro")
})

app.get("/publicar", verificarToken, async (req, res) => {

    try {
        let categorias = await getCategorias();
        let usuario = req.usuario

        res.render("publicar",{
        usuario,
        categorias
    })
    } catch (error) {
        console.log(error)
        res.render("publicar",{
            error: "Se ha generado un error que no permite cargar los datos de la vista."
        })
    }
})


app.get("/clasico", (req, res) => {
    getCategoriaByName("Clásico")
    .then(publicaciones => {
        publicaciones = publicaciones.map(publicacion => {
            publicacion.fecha = moment(publicaciones.fecha).format('DD-MM-YYYY')
            return publicacion
        })
        res.render("clasico",{
            publicaciones 
        })
    })
        .catch(error => {
            res.render("clasico",{
                error: "No se pudieron cargar las categorias"
            })
        })
    })
app.get("/moderno", (req, res) => {
    getCategoriaByName("Moderno")
    .then(publicaciones => {
        publicaciones = publicaciones.map(publicacion => {
            publicacion.fecha = moment(publicaciones.fecha).format('DD-MM-YYYY');
            return publicacion
        })

        res.render("moderno",{
            publicaciones
        })
    
        }).catch(error => {
            res.render("moderno",{
                error: "No se pudieron cargar las categorias"
            })
        })
    })

app.get("/publicacion/:id",  async (req, res) => {
        try{
            let {token} = req.query;
            let idUsuario;

            jwt.verify(token, SECRETO, (error, data) => {
                if(data) idUsuario = data.usuario.id
            })
            

            let {id} = req.params;
            let comentarios = await getComentarios(id);
            let cantidadComentarios = await getCantidadComentarios(id);
            let like;
            if(idUsuario){
                like = await getLike(idUsuario, id)
            }

            if(like == undefined){
                like=null;
            }else{
                like = like.islike
            }
            comentarios = comentarios.map(comentario => {
                comentario.fecha = moment(comentario.fecha).format('DD-MM-YYYY')
                return comentario
            })

            let likeDislikes = await cantidadLikeAndDislike(id);
            console.log(likeDislikes);
            let cantidadLikes = 0;
            let cantidadDislikes = 0;

            likeDislikes.forEach(elemento => {
                if(elemento.islike == true) cantidadLikes = elemento.count;
                if(elemento.islike == false) cantidadDislikes = elemento.count;
            })


            getPublicacionById(id).then(publicacion => {
                publicacion.fecha = moment(publicacion.fecha).format('DD-MM-YYYY')
                res.render("detalle_publicacion",{
                    publicacion,
                    comentarios,
                    cantidad: cantidadComentarios,
                    like: like,
                    cantidadLikes,
                    cantidadDislikes

            })
            })
            .catch(error => {
                console.log(error)
            res.render("detalle_publicacion",{
                error: "No se pudo encontrar la publicación"
            })
        })

        }catch(error){
            console.log(error)
            res.render("detalle_publicacion",{
                error: "Error al cargar los comentarios"
            })
        }
    })




//ENDPOINTS

app.post("/api/v1/login", (req, res) => {
    try {
        let {email, password} = req.body;
        getUsuarioByEmailAndPassword(email, password)
        .then(usuario => {
            console.log(usuario)
            if(usuario == undefined) return res.status(401).json({code: 401, message: "Pruebe intentando otra vez"})
            let tokenKey
            jwt.sign({usuario}, SECRETO, (err, token) => {
                if(err){
                    res.status(500).json({code: 500, message: "No se pudo emitir un token"})
                }else{
                    tokenKey = token;
                    res.status(200).json({code: 200, token: tokenKey})
                }
            })
        }).catch(error => {
            console.log(error)
            res.status(500).json({code: 500, message: "Error del servidor"})
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({code: 500, message: "Error del servidor"})
    }
    
})


app.post("/api/v1/registro", async (req, res) => {

    try {
        let {nombre, email, password} = req.body;
        if(!nombre || !email || !password)
        return res.status(400).json({code: 400, message: "no ha proporcionado todo el contenido requerido."})

        let usuario = await addUsuario(nombre, email, password);
        if(!usuario) throw new Error ("No se pudo crear el usuario.")
        res.status(201).json({code: 201, message: "Registro con éxito."})

    } catch (error) {
        res.status(500).json({code: 500, message: "Error del servidor"})
    }
})

app.post("/api/v1/publicar", verificarToken, upload, (req, res) => {

    try{
        let {titulo, contenido, idCategoria} = req.body;

        if(titulo ==undefined || contenido == undefined || idCategoria == undefined){
            fs.unlinkSync(path.resolve("./public/img/"+ req.imagen));
            return res.status(400).json({code: 400, message: "no ha proporcionado todo el contenido requerido."})
        }

        console.log(req.usuario)
        addPublicacion(titulo, contenido, idCategoria, req.usuario.id, req.imagen)
        .then(respuesta => {
            res.status(201).json({code: 201, message: "Publicación realizada con éxito."})
        }).catch(error => {
            console.log(error)
            fs.unlinkSync(path.resolve("./public/img/"+ req.imagen));
            res.status(500).json({code: 500, message: "Error con la base de datos."})
        })

    }catch(error){
        fs.unlinkSync(path.resolve("./public/img/"+ req.imagen));
        res.status(500).json({code: 500, message: "no se pudo realizar la publicación"})
    }
})


app.post("/api/v1/comentarios", verificarToken, async (req, res) => {

    try{

        let {comentario, idPublicacion} = req.body;
        console.log(comentario, req.usuario.id, idPublicacion)

        let respuesta = await addComentario(comentario, req.usuario.id, idPublicacion)

        res.status(201).json({code: 201, message: "Comentario realizado con éxito."})
    }catch(error){
        console.log(error)
        res.status(500).json({code: 500, message: "no se pudo crear el comentario."})
    }
    
})

app.post("/api/v1/like", verificarToken, async (req, res) => {
    try{
        let {idPublicacion} = req.body;
        let idUsuario = req.usuario.id;
        await darLike(idUsuario, idPublicacion);

        res.status(201).json({code: 201, message: "like/dislike realizado con éxito."})
    }catch(error){
        console.log(error)
        res.status(500).json({code: 500, message: "No fue posible realizar el like/dislike."})
    }
})


let PORT = process.env.PORT || 3000

app.listen(PORT, ()=> console.log("http://localhost:"+PORT))










app.all("*", (req, res) => {
    res.send("<p>Ruta no existe <a href='/'>Volver</a></p>")
})

