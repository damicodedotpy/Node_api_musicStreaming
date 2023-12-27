// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment")
// ******************************OWN LIBRARIES***********************************
require("dotenv").config();
// ******************************************************************************

// Crear token de usuario con JWT
const createToken = (userInfo) => {

    // Crear payload del token con los datos del usuario
    const payload = {
        id: userInfo._id,
        name: userInfo.name,
        surname: userInfo.surname,
        nick: userInfo.nick,
        email: userInfo.email,
        password: userInfo.password,
        role: userInfo.role,
        image: userInfo.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    }

    // Devolver token firmado con el SECRET_KEY
    return jsonwebtoken.sign(payload, process.env.SECRET_KEY)
}

// Exportar funciones
module.exports = {
    createToken
}