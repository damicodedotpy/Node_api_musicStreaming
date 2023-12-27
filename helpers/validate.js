// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const validator = require("validator");
// ******************************OWN LIBRARIES***********************************

// ******************************************************************************

const registerDataValidation = (params) => {
    // Validate name
    if (!params.name) throw new Error("NAME_NOT_PROVIDED");
    else if (!validator.isAlpha(params.name.replace(/\s/g, "", "es-ES")) || 
    !validator.isLength(params.name, {min:3, max: undefined})) throw new Error("NAME_ERROR");

    // Validate nick
    if(!params.nick) throw new Error("NICK_NOT_PROVIDED");
    else if(!validator.isAlphanumeric(params.nick) || 
    !validator.isLength(params.nick, {min: 2, max: 50})) throw new Error("NICK_ERROR");

    // Validate email
    if(!params.email) throw new Error("EMAIL_NOT_PROVIDED");
    else if(!validator.isEmail(params.email)) throw new Error("EMAIL_ERROR");

    // Validate password
    if(!params.password) throw new Error("PASSWORD_NOT_PROVIDED");
    else if(!validator.isStrongPassword(params.password)) throw new Error("PASSWORD_ERROR");

    // Validate surname
    if (params.surname) {
        if (!validator.isAlpha(params.surname.replace(/\s/g, "", "es-ES")) || 
        !validator.isLength(params.surname, {min:3, max: undefined})) throw new Error("SURNAME_ERROR");
    };
};

const loginDataValidation = (params) => {
    // Validate email
    if (!params.email) throw new Error("EMAIL_NOT_PROVIDED");
    else if (!validator.isEmail(params.email)) throw new Error("EMAIL_ERROR");

    // Validate password
    if (!params.password) throw new Error("PASSWORD_NOT_PROVIDED");
    else if (!validator.isStrongPassword(params.password)) throw new Error("PASSWORD_ERROR");
}

module.exports = {
    registerDataValidation,
    loginDataValidation
}