// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const path = require("path");
const fs = require("fs");
// ********************************OWN LIBRARIES*********************************
const Song = require('../models/Song');
// ******************************************************************************

// Crear cancion
const save = async (req, res) => {
    try {
        // Obtener parametros
        const params = req.body;

        // Lanzar error si no hay parametros
        if (!params) throw new Error("DATA_REQUIRED");

        // Verificar que los parametros requeridos esten presentes
        ["album", "track", "name", "file"].forEach((param) => {
            if (!req.body[param]) throw new Error(`${param.toUpperCase()}_REQUIRED`);
        });

        // Verificar que si la cancion ya existe
        if (await Song.findOne({ "name": params.name, "album": params.album})) {
            throw new Error("SONG_ALREADY_EXISTS");
        }

        // Crear objeto de cancion
        const newSong = new Song(params);

        if (!newSong) throw new Error("ERROR_CREATING_SONG");
        
        // Guardar cancion
        newSong.save();

        // Devolver respuesta de exito
        return res.status(200).send({
            status: "success",
            message: "Saludos desde el controlador de canciones",
            newSong
        });

    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error saving the song"

        // Mensaje de error personalizado: Informacion vacia para crear cancion 
        if (error.message == "DATA_REQUIRED") errorMessage = "Data is required";

        // Mensaje de error personalizado: Album no especificado
        if (error.message == "ALBUM_REQUIRED") errorMessage = "Album is required";
        
        // Mensaje de error personalizado: Track no especificado
        if (error.message == "TRACK_REQUIRED") errorMessage = "Track is required";

        // Mensaje de error personalizado: Nombre no especificado
        if (error.message == "NAME_REQUIRED") errorMessage = "Name is required";

        // Mensaje de error personalizado: Archivo no especificado
        if (error.message == "FILE_REQUIRED") errorMessage = "File is required";

        // Mensaje de error personalizado: Cancion ya existe
        if (error.message == "SONG_ALREADY_EXISTS") errorMessage = "Song already exists";

        // Mensaje de error personalizado: Error al crear cancion
        if (error.message == "ERROR_CREATING_SONG") errorMessage = "Error creating song";

        // Devolver respuesta de error
        return res.status(500).send({
            message: errorMessage
        });
    };
};

// Obtener una cancion especifica
const one = async (req, res) => {
    try {
        // Extraer ID de la cancion
        const songID = req.params.songID;

        const options = {
            populate: { path: "album", select: "-__v -created_at"},
            select: "-__v -created_at"
        }

        // Buscar cancion en la base de datos
        const song = await Song.paginate({ _id: songID }, options);

        // Lanzar error si no se encuentra la cancion
        if (!song) throw new Error("SONG_NOT_FOUND");

        // Devolver respuesta de exito
        return res.status(200).send({
            status: "success",
            message: "Song found successfully",
            song: song.docs
        })
    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error getting the song";

        // Mensaje de error personalizado: Cancion no encontrada
        if (error.message == "SONG_NOT_FOUND") errorMessage = "Song not found";

        // Devolver respuesta de error
        return res.status(500).send({
            message: errorMessage
        });
    };
};

// Obtener lista de canciones de un album
const list = async (req, res) => {
    try {
        const albumID = req.params.albumID;

        const page = req.params.page || 1;

        const options = {
            page,
            limit: 5,
            populate: { path: "album", select: "-__v -created_at"},
            select: "-__v -created_at"
        };

        const songs = await Song.paginate({ "album": albumID }, options);

        return res.status(200).send({
            status: "success",
            message: "Songs found successfully",
            songs: songs.docs,
            page: songs.page,
            pages: songs.totalPages,
            totalDocs: songs.totalDocs,
        })
    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error getting the songs";

        // Devolver respuesta de error
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    }
}

// Actualizar cancion
const update = async (req, res) => {
    try {
        // Extraer ID de la cancion
        const songID = req.params.songID;

        // Extraer datos para actualizar la cancion
        const newData = req.body;

        // Lanzar error si no hay datos para realizar la actualizacion
        if (!newData) throw new Error("NO_DATA_PROVIDED");

        // Buscar cancion en la base de datos y actualizarla
        const song = await Song.findByIdAndUpdate(songID, newData, { new: true });

        // Lanzar error si no se encuentra la cancion
        if (!song) throw new Error("SONG_NOT_FOUND");

        // Devolver respuesta de exito
        return res.status(200).send({
            status: "success",
            message: "Song updated successfully",
            song
        });

    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error updating the song";

        // Mensaje de error personalizado: Cancion no encontrada
        if (error.message == "NO_DATA_PROVIDED") errorMessage = "No data provided";

        // Mensaje de error personalizado: Cancion no encontrada
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Eliminar cancion
const remove = async (req, res) => {
    try {
        // Extraer ID de la cancion
        const songID = req.params.songID;

        // Lanzar error si no hay ID de cancion
        if (!songID) throw new Error("SONG_ID_REQUIRED");

        // Buscar cancion en la base de datos y eliminarla
        const song = await Song.findByIdAndDelete(songID);

        // Lanzar error si no se encuentra la cancion
        if (!song) throw new Error("SONG_NOT_FOUND");

        // Devolver respuesta de exito
        return res.status(200).send({
            status: "success",
            message: "Song deleted successfully"
        });

    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error deleting the song";

        // Mensaje de error personalizado: ID de cancion no especificado
        if (error.message == "SONG_ID_REQUIRED") errorMessage = "Song ID is required";

        // Mensaje de error personalizado: Cancion no encontrada
        if (error.message == "SONG_NOT_FOUND") errorMessage = "Song not found";

        // Devolver respuesta de error
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Subir archivo de cancion
const upload = async (req, res) => {
    try {
        // Extraer ID de la cancion
        const songID = req.params.songID;

        // Extraer extension del archivo
        const fileExtension = req.file.filename.split(".")[1];

        // Verificar que la extension del archivo sea valida
        if (!["mp3", "wav"].includes(fileExtension)) {
            fs.unlinkSync(req.file.path);
            throw new Error("INVALID_FILE_EXTENSION");
        };

        // Buscar cancion en la base de datos y actualiza el nombre del archivo
        const song = await Song.findByIdAndUpdate({"_id": songID}, { "file": req.file.filename }, { new: true });

        // Eliminar propiedades innecesarias del objeto
        delete song._doc.__v;
        delete song._doc.created_at;

        // Lanzar error si no se encuentra la cancion
        if (!song) throw new Error("SONG_NOT_FOUND");

        // Devolver respuesta de exito
        return res.status(200).send({
            status: "success",
            message: "Song uploaded successfully",
            song
        });
    } catch (error) {
        // Mensaje de error standar
        errorMessage = "There was an error uploading the song";

        // Mensaje de error personalizado: Extension de archivo invalida
        if (error.message == "INVALID_FILE_EXTENSION") errorMessage = "Invalid file extension";

        // Devolver respuesta de error
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Función para obtener el archivo de audio de una canción
const audio = (req, res) => {
    try {
        // Obtener el nombre del archivo de la canción
        const songFile = req.params.songFile;

        // Construir la ruta del archivo
        const filePath = path.join(__dirname, `../uploads/songs/${songFile}`);

        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) throw new Error("SONG_NOT_FOUND");

        // Enviar el archivo como respuesta
        return res.sendFile(filePath);

    } catch (error) {
        // Mensaje de error estándar
        errorMessage = "There was an error getting the song";

        // Mensaje de error personalizado: Canción no encontrada
        if (error.message == "SONG_NOT_FOUND") errorMessage = "Song not found";

        // Devolver respuesta de error
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Exportar funciones
module.exports = {
    save,
    one,
    list,
    update,
    remove,
    upload,
    audio
}