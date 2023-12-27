// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");
const bcrypt = require("bcrypt");
// ******************************OWN LIBRARIES***********************************
const User = require("../models/user"); 
// ******************************************************************************

const auth = async (req, res, next) => {
    try {
        // Verificar si existe el token en la cabecera de la peticion
        if (!req.headers.authorization) throw new Error("TOKEN_NOT_FOUND");
        
        // Obtener el token de la cabecera de la peticion y eliminar comillas
        const token = req.headers.authorization.replace(/['"]+/g, "");
        
        // Decodificar el token y obtener el payload
        const payload = jsonwebtoken.decode(token, process.env.SECRET_KEY);

        // Verificar si el token ha expirado (payload.exp es la fecha de expiracion del token)
        if (payload.exp <= moment().unix()) throw new Error("TOKEN_EXPIRED");

        // Verificar si el usuario existe en la base de datos
        const user = await User.findById(payload.id, "+password");

        // Lanzar error si el usuario no existe
        if (!user) throw new Error("USER_NOT_FOUND");

        // Rellenar el objeto req de la peticion con los datos del usuario logueado
        req.token = payload;

        // Pasar al siguiente middleware o controlador endpoint
        next();

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error authenticating the user";

        // Mensaje de error personalizado: Token no proporcionado
        if (error.message === "TOKEN_NOT_FOUND") errorMessage = "Token not found";

        // Mensaje de error personalizado: Token expirado   
        if (error.message === "TOKEN_EXPIRED") errorMessage = "Token expired";

        // Mensaje de error personalizado: Usuario no encontrado
        if (error.message === "USER_NOT_FOUND") errorMessage = "User not found";
        
        // Devolver respuesta de error
        return res.status(403).json({
            status: "error",
            message: errorMessage
        });
    };
};

// Exportar el modulo
module.exports = auth;