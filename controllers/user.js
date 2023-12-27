// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
// ******************************OWN LIBRARIES***********************************
const {registerDataValidation, loginDataValidation} = require("../helpers/validate");
const {createToken} = require("../services/jwt");
const User = require("../models/user");
// ******************************************************************************

// Registrar y crear usuario
const register = async (req, res) => {
    try {
        // Recoger datos de la peticion
        let params = req.body;

        // Validar los datos
        registerDataValidation(params);

        // Controlar usuarios duplicados
        const user = await User.find({$or: [
            {"email": params.email},
            {"nick": params.nick}
        ]});
        
        // Lanzar error si el usuario ya existe
        if (user.length > 0) throw new Error("USER_ALREADY_EXISTS");
        
        // Cifrar la contraseña
        params.password = await bcrypt.hash(params.password, 10);
        
        // Crear objeto del usuario
        const newUser = new User(params);
        
        // Lanzar error si no se ha podido crear el objeto del usuario
        if (!newUser) throw new Error("USER_ERROR_OBJECT");

        // Guardar usuario en la base de datos
        const saveUser = await newUser.save();
        
        // Lanzar error si no se ha podido guardar el usuario en la base de datos
        if (!saveUser) throw new Error("USER_ERROR_SAVING");

        // Crear objeto del usuario para eliminar campos sensibles
        const securedObject = newUser.toObject();

        // Eliminar campos sensibles
        delete securedObject.password;
        delete securedObject.role;
        delete securedObject.__v; 
        
        // Limpiar el objeto a devolver
        return res.status(200).json({
            status: "success",
            message: "User registered successfully",
            user: securedObject
        });

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error registering the user";

        // Mensaje de error personalizado: Nombre no proporcionado
        if(error.message == "NAME_NOT_PROVIDED") errorMessage = "The name is required";

        // Mensaje de error personalizado: Nombre no válido
        if(error.message == "NAME_ERROR") errorMessage = "The name is not valid";

        // Mensaje de error personalizado: Nick no proporcionado
        if(error.message == "NICK_NOT_PROVIDED") errorMessage = "The nick is required";

        // Mensaje de error personalizado: Nick no válido
        if(error.message == "NICK_ERROR") errorMessage = "The nick is not valid";

        // Mensaje de error personalizado: Email no proporcionado
        if(error.message == "EMAIL_NOT_PROVIDED") errorMessage = "The email is required";

        // Mensaje de error personalizado: Email no válido
        if(error.message == "EMAIL_ERROR") errorMessage = "The email is not valid";
    
        // Mensaje de error personalizado: Contraseña no proporcionada
        if(error.message == "PASSWORD_NOT_PROVIDED") errorMessage = "The password is required";

        // Mensaje de error personalizado: Contraseña no válida
        if(error.message == "PASSWORD_ERROR") errorMessage = "The password is not valid";

        // Mensaje de error personalizado: Apellido no válido
        if(error.message == "SURNAME_ERROR") errorMessage = "The surname is not valid";

        // Mensaje de error personalizado: Usuario ya existe
        if (error.message == "USER_ALREADY_EXISTS") errorMessage = "The user already exists";

        // Mensaje de error personalizado: Error al crear el objeto del usuario
        if (error.message == "USER_ERROR_OBJECT") errorMessage = "There was an error creating the user object";

        // Mensaje de error personalizado: Error al guardar el usuario en la base de datos
        if (error.message == "USER_ERROR_SAVING") errorMessage = "There was an error saving the user";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage,
        });
    };
};

// Login de usuario
const login = async (req, res) => {
    try {
        // Recoger datos de la peticion
        const params = req.body;

        // Comprobar que llegaron los datos
        loginDataValidation(params);

        // Buscar en la base de datos si existe el usuario
        const user = await User.findOne({"email": params.email}, "+password");

        // Lanzar error si el usuario no existe
        if (!user) throw new Error("CREDENTIALS_ERROR");

        // Comprobar contraseña
        const passwordMatch = await bcrypt.compareSync(params.password, user.password);

        // Lanzar error si la contraseña no es correcta
        if (!passwordMatch) throw new Error("CREDENTIALS_ERROR");

        // Conseguir token jwt (crear servicio que devuelva el token)
        const token = createToken(user);

        // Lanzar error si no se ha podido crear el token
        if (!token) throw new Error("TOKEN_ERROR");

        // Devolver los datos del usuario logueado y el token jwt
        return res.status(200).json({
            status: "success",
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error logging in";

        // Mensaje de error personalizado: Email no proporcionado
        if (error.message == "EMAIL_NOT_PROVIDED") errorMessage = "The email is required";

        // Mensaje de error personalizado: Email no válido
        if (error.message == "EMAIL_ERROR") errorMessage = "The email is not valid";

        // Mensaje de error personalizado: Contraseña no proporcionada
        if (error.message == "PASSWORD_NOT_PROVIDED") errorMessage = "The password is required";

        // Mensaje de error personalizado: Contraseña no válida
        if (error.message == "PASSWORD_ERROR") errorMessage = "The password is not valid";

        // Mensaje de error personalizado: Credenciales no válidas (email o contraseña incorrectos)
        if (error.message == "CREDENTIALS_ERROR") errorMessage = "Email or password incorrect";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage
        });
    };
};

// Mostrar perfil de un usuario
const profile = async (req, res) => {
    try {
        // Recoger ID usuario de la url
        const userID = req.params.id;

        // Lanzar error si no se ha proporcionado el ID
        if (!userID) throw new Error("ID_NOT_PROVIDED");
        
        // Consulta para sacar los datos del perfil
        const user = await User.findById(userID);

        // Lanzar error si el usuario no existe
        if (!user) throw new Error("USER_NOT_FOUND");
    
        // Devolver respuesta con los datos del usuario
        return res.status(200).json({    
            status: "success",
            message: "User profile",
            user
        });

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error getting the user profile";

        // Mensaje de error personalizado: ID no proporcionado
        if (error.message == "ID_NOT_PROVIDED") errorMessage = "The user ID is required";

        // Mensaje de error personalizado: Usuario no encontrado
        if (error.message == "USER_NOT_FOUND") errorMessage = "The user does not exist";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage
        });
    }
}

// Actualizar datos de un usuario
const update = async (req, res) => {
    try {
        // Recoger datos del usuario identificado
        const userToken = req.token;

        // Lanzar error si no se ha proporcionado el token
        if (!userToken) throw new Error("TOKEN_NOT_PROVIDED");
        
        // Recoger datos a actualizar
        const newData = req.body;

        // Lanzar error si no se ha proporcionado ningún dato
        if (!newData) throw new Error("DATA_NOT_PROVIDED"); 
        
        console.log("Antes de buscar el usuario")
        // Comprobar si el usuario existe
        const userExist = await User.find({$or: [
            {"email": newData.email},
            {"nick": newData.nick}
        ]});
        
        // Comprobar si el email es único
        userExist.forEach( user => {
            if (user && user._id != userToken.id) throw new Error("USER_ALREADY_EXISTS");
        });

        // Cifrar password si se ha enviado
        if (newData.password) newData.password = await bcrypt.hash(newData.password, 10);
        
        // Buscar y actualizar documento en la base de datos
        const userUpdated = await User.findByIdAndUpdate(userToken.id, newData)

        // Lanzar error si no se ha podido actualizar el usuario
        if (!userUpdated) throw new Error("USER_NOT_UPDATED");
        
        // Devolver respuesta
        res.status(200).json({
            status: "success",
            message: "User update",
            user: userUpdated
        });
        
    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error updating the user";

        // Mensaje de error personalizado: Token no proporcionado
        if (error.message == "TOKEN_NOT_PROVIDED") errorMessage = "The token is required";

        // Mensaje de error personalizado: Datos no proporcionados
        if (error.message == "DATA_NOT_PROVIDED") errorMessage = "The data is required";

        // Mensaje de error personalizado: Usuario no encontrado
        if (error.message == "USER_ALREADY_EXISTS") errorMessage = "The user already exists";

        // Mensaje de error personalizado: Usuario no encontrado
        if (error.message == "USER_NOT_UPDATED") errorMessage = "There was an error updating the user";

        // Mensaje de error personalizado: Usuario no encontrado
        if (error.message == "USER_NOT_FOUND") errorMessage = "The user does not exist";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage
        });
    }
}

// Subir avatar (foto) de un usuario
const upload = async (req, res) => {
    try {
        // Extraer y separar la extension del archivo 
        const extension = req.file.originalname.split(".")[1];

        // Listar extensiones permitidas
        const allowedExtensions = ["png", "jpg", "jpeg", "gif"];

        // Verificar que la extension del archivo es permitida
        if (!allowedExtensions.includes(extension)) {
            fs.unlinkSync(req.file.path);
            throw new Error("EXTENSION_NOT_ALLOWED");
        };

        // Actualizar imagen del usuario
        const updateImage = await User.findOneAndUpdate({"_id": req.token.id}, {"image": req.file.filename});

        // Lanzar error si no se ha podido actualizar la imagen
        if (!updateImage) throw new Error("IMAGE_NOT_UPDATED"); 

        // Devolver respuesta
        return res.status(200).json({
            status: "success",
            message: "Saludos desde el controlador de upload",
            file: req.file
        });

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error uploading the file";

        // Mensaje de error personalizado: Token no proporcionado
        if (error.message == "EXTENSION_NOT_ALLOWED") errorMessage = "The extension is not allowed";

        // Mensaje de error personalizado: Token no proporcionado
        if (error.message == "IMAGE_NOT_UPDATED") errorMessage = "There was an error updating the image";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage
        });
    };
};

// Mostrar avatar (foto) de un usuario
const avatar = (req, res) => {
    try {
        // Lanzar error si no se ha proporcionado el nombre del archivo
        if (!req.params.fileName) throw new Error("FILE_NOT_PROVIDED");
        
        // Ruta del archivo
        const filePath = path.join(__dirname, "../uploads/avatars/" + req.params.fileName);

        // Comprobar si existe el archivo
        if (!fs.existsSync(filePath)) throw new Error("FILE_NOT_FOUND");

        // Devolver el archivo
        return res.sendFile(filePath);
        
    } catch (error) {
        // Mensaje de error estandar
        let errorMessage = "There was an error getting the avatar";

        // Mensaje de error personalizado: Token no encontrado
        if (error.message == "FILE_NOT_FOUND") errorMessage = "The file does not exist";

        // Mensaje de error personalizado: Nombre de archivo no proporcionado
        if (error.message == "FILE_NOT_PROVIDED") errorMessage = "The file is required";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage
        });
    };
};

// Exportar funciones
module.exports = {
    register,
    login,
    profile,
    update,
    upload,
    avatar
};