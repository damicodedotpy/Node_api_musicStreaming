// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const express = require("express");
const cors = require("cors");
require("dotenv").config();
// ******************************OWN LIBRARIES***********************************
const connection = require("./database/conection");
const artistRoutes = require("./routes/artist");
const albumRoutes = require("./routes/album");
const userRoutes = require("./routes/user");
const songRoutes = require("./routes/song");
// ******************************************************************************
// Mensaje de bienvenida
console.log("API REST con node para la app de musica arrancada");

// Ejecutar conexion a la red
connection();

// Crear servidor de node
const app = express();

// Configurar cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar configuracion de rutas
app.use(`${process.env.USER_ROUTE_PREFIX}`, userRoutes);
app.use(`${process.env.ARTIST_ROUTE_PREFIX}`, artistRoutes);
app.use(`${process.env.ALBUM_ROUTE_PREFIX}`, albumRoutes);
app.use(`${process.env.SONG_ROUTE_PREFIX}`, songRoutes);

// Poner el servidor a escuchar peticiones
app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.EXPRESS_PORT}`);
});
