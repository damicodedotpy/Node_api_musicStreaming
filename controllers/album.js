// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const path = require("path");
const fs = require("fs");
// ******************************OWN LIBRARIES***********************************
const Album = require("../models/Album");
const Song = require("../models/Song");
// ******************************************************************************

// Crear un nuevo album
const save = async (req, res) => {
    try {
        // Extraer los datos del album del body
        const params = req.body;

        // Validar que el artista y el título existan en el body
        ["artist", "title"].forEach(key => {
            if (!params[key]) throw new Error(`${key.toUpperCase()}_REQUIRED`);
        });

        // Validar si el album ya existe en la base de datos
        if(await Album.findOne({ artist: params.artist.toLowerCase(), title: params.title.toLowerCase() })) {
            throw new Error("ALBUM_ALREADY_EXISTS");
        };

        // Crear el objeto del album
        const newAlbum = new Album(params);

        // Guardar el album en la base de datos
        newAlbum.save();

        // Devolver una respuesta al cliente
        return res.status(200).send({
            message: "Saludos desde el controlador de album",
            params
        });
    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error saving the album";

        // Mensaje de error personalizado: Álbum ya existe
        if (error.message == "ALBUM_ALREADY_EXISTS") errorMessage = "The album already exists";
        
        // Mensaje de error personalizado: Artista no encontrado
        if (error.message == "ARTIST_REQUIRED") errorMessage = "The artist is required";

        // Mensaje de error personalizado: Título no encontrado
        if (error.message == "TITLE_REQUIRED") errorMessage = "The title is required";

        // Devolver una respuesta al cliente
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Mostar todos los albums de un artista
const list = async (req, res) => {
    try {
        // Extraer el id del artista de los parámetros de la url
        const artistID = req.params.artistID;

        // Lanzar un error si no se ha recibido el id del artista
        if (!artistID) throw new Error("ARTIST_REQUIRED");
    
        // Opciones de configuración de la paginación
        const options = {
            page: req.params.page || 1,
            limit: 5,
            sort: { "year": 1},
            populate: [{ path: "artist" }]
        }
    
        // Obtener los albums del artista y paginarlos
        const albums = await Album.paginate({"artist": artistID}, options, (err, albums) => {
            if (err || albums.length === 0) throw new Error("ALBUM_NOT_FOUND");
            return albums;
        });

        // Devolver una respuesta al cliente
        return res.status(200).send({
            message: "Saludos desde el controlador de album",
            page: albums.page,
            totalPages: albums.totalPages,
            totalDocs: albums.totalDocs,
            docs: albums.docs
        });
        
    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error getting the album";

        // Mensaje de error personalizado: Artista no encontrado
        if (error.message == "ARTIST_REQUIRED") errorMessage = "The artist is required";

        // Mensaje de error personalizado: Álbum no encontrado
        if (error.message == "ALBUM_NOT_FOUND") errorMessage = "The album was not found";

        // Devolver una respuesta de error al cliente
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Actualizar un album
const update = async (req, res) => {
    try {
        // Extraer el id del album de los parámetros de la url
        const albumID = req.params.albumID;

        // Lanzar un error si no se ha recibido el id del album
        if (!albumID) throw new Error("ALBUM_ID_REQUIRED");

        // Extraer los datos del album del body
        const newData = req.body;

        // Lanzar un error si no se ha recibido ningún dato para actualizar
        if (!newData) throw new Error("NO_DATA");

        // Actualizar el album en la base de datos
        const updateAlbum = await Album.updateOne({"_id": albumID}, newData);

        // Lanzar un error si no se ha encontrado el album
        if (!updateAlbum) throw new Error("ALBUM_NOT_FOUND");

        // Devolver una respuesta al cliente
        return res.status(200).send({
            status: "success",
            message: "Album updated successfully",
            updateAlbum
        });
        
    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error updating the album";

        // Mensaje de error personalizado: ID del álbum no encontrado
        if (error.message == "ALBUM_ID_REQUIRED") errorMessage = "The album ID is required";

        // Mensaje de error personalizado: Álbum no encontrado
        if (error.message == "ALBUM_NOT_FOUND") errorMessage = "The album was not found";

        // Mensaje de error personalizado: No se han recibido datos para actualizar
        if (error.message == "NO_DATA") errorMessage = "No data to update";

        // Devolver una respuesta de error al cliente
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    }
}

// Subir una imagen para el album
const upload = async (req, res) => {
    try {
        // Extraer el id del album de los parámetros de la url
        const albumID = req.params.albumID;

        // Lanzar un error si no se ha recibido el id del album
        if (!albumID) throw new Error("ALBUM_ID_REQUIRED");

        // Extraer la extensión del archivo
        const fileExtension = req.file.originalname.split(".")[1];

        // Lanzar un error si no se ha recibido el archivo
        if (!req.file) throw new Error("FILE_REQUIRED");

        // Comprobar que la extensión del archivo sea válida y eliminar el archivo si no lo es
        if (!["png", "jpg", "jpeg", "gif"].includes(fileExtension)) {
            fs.unlinkSync(req.file.path);
            throw new Error("INVALID_FILE_EXTENSION");
        };

        // Actualizar el nombre de la imagen del album en la base de datos
        const updatedAlbum = await Album.findByIdAndUpdate(albumID, { "image": req.file.filename });

        // Devolver una respuesta al cliente
        return res.status(200).send({
            status: "success",
            message: "Saludos desde el controlador de album",
            updatedAlbum
        });

    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error uploading the image";

        // Mensaje de error personalizado: ID del álbum no encontrado
        if (error.message == "INVALID_FILE_EXTENSION") errorMessage = "Invalid file extension";

        // Mensaje de error personalizado: ID del álbum no encontrado
        if (error.message == "ALBUM_ID_REQUIRED") errorMessage = "The album ID is required";

        // Mensaje de error personalizado: Álbum no encontrado
        if (error.message == "ALBUM_NOT_FOUND") errorMessage = "The album was not found";

        // Devolver una respuesta de error al cliente
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Obtener la imagen de un album
const image = (req, res) => {
    try {
        // Extraer el nombre del archivo de los parámetros de la url
        const albumFile = req.params.albumFile;

        // Crear ruta path del archivo
        const pathFile = path.join(__dirname,`../uploads/albums/${albumFile}`);

        // Comprobar si el archivo existe
        if (!fs.existsSync(pathFile)) throw new Error("IMAGE_NOT_FOUND");

        // Devolver una respuesta al cliente
        return res.sendFile(path.resolve(pathFile));
        
    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error getting the image";

        // Mensaje de error personalizado: Imagen no encontrada
        if (error.message == "IMAGE_NOT_FOUND") errorMessage = "Image not found";

        // Devolver una respuesta de error al cliente
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Función para eliminar un álbum y sus canciones asociadas
const remove = async (req, res) => {
    try {
        // Obtener el ID del álbum de los parámetros de la URL
        const albumID = req.params.albumID;
        
        // Verificar si el ID del álbum está presente
        if (!albumID) throw new Error("ALBUM_ID_REQUIRED"); 

        // Eliminar el álbum de la base de datos
        const album = await Album.deleteOne({"_id": albumID});

        // Verificar si el álbum fue eliminado correctamente
        if (album.deletedCount == 0) throw new Error("ALBUM_NOT_FOUND");

        // Eliminar las canciones asociadas al álbum
        const songs = await Song.deleteMany({"album": albumID});

        // Verificar si las canciones fueron eliminadas correctamente
        if (songs.deletedCount == 0) throw new Error("SONGS_NOT_FOUND");

        // Enviar una respuesta exitosa al cliente
        return res.status(200).send({
            status: "success",
            message: "Album & songs deleted successfully"
        });

    } catch (error) {
        // Mensaje de error estándar
        errorMessage = "There was an error deleting the album";

        // Mensaje de error personalizado: ID del álbum requerido
        if (error.message == "ALBUM_ID_REQUIRED") errorMessage = "The album ID is required";

        // Mensaje de error personalizado: Álbum no encontrado
        if (error.message == "ALBUM_NOT_FOUND") errorMessage = "The album was not found";

        // Mensaje de error personalizado: Canciones no encontradas
        if (error.message == "SONGS_NOT_FOUND") errorMessage = "The songs were not found";

        // Enviar una respuesta de error al cliente
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Exportar los métodos del controlador
module.exports = {
    save,
    list,
    update,
    upload,
    image,
    remove
}