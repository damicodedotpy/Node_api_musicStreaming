// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const mongoose = require("mongoose");
require("dotenv").config();
// ******************************OWN LIBRARIES***********************************

// ******************************************************************************
// Coneccion a la base de datos
const connection = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Coneccion exitosa a la base de datos")
    } catch (error) {
        console.log(error);
        throw new Error("Error al conectar con la base de datos");
    }
};

// Exportar la conexion
module.exports = connection;