const express = require('express');
const {create}= require('express-handlebars');
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const {getPublicaciones, getUsuarioByEmailAndPassword} = require('./consultas.js')

const app = express();

const PORT = process.env.PORT || 3000;
const SECRETO = process.env.SECRETO || "123456";


//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/public', express.static('public'));



//configuración handlebars

const hbs = create({
	partialsDir: [
		"views/partials/",
	],
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

//fin configuración handlebars


app.listen(PORT, () => console.log("http://localhost:"+PORT));

//RUTAS DE VISTA
app.get("/", async (req, res) => {
    try {
        let publicaciones = await getPublicaciones();
        publicaciones = publicaciones.map(publicacion => {
            publicacion.fecha = moment(publicaciones.fecha).format('DD-MM-YYYY')
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



//ENDPOINTS

app.post("/api/v1/login", (req, res) => {
    try {
        let {email, password} = req.body;
        getUsuarioByEmailAndPassword(email, password)
        .then(usuario => {
            if(usuario.length ==0) return res.status(401).json({code: 401, message: "Pruebe intentando otra vez"})
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

