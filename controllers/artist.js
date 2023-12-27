// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const path = require("path");
const fs = require("fs");
// ******************************OWN LIBRARIES***********************************
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Song = require("../models/Song");
// ******************************************************************************

// Crear un artista
const save = async (req, res) => {
    try {
        // Extraer los datos del artista del body
        const params = req.body;

        // Lanzar error si no se envió el nombre del artista
        if (!params.name) throw new Error("NAME_REQUIRED");

        // Crear el objeto artista
        const artist = new Artist(params);

        // Lanzar error si el objeto artista no es válido
        if (!artist) throw new Error("ARTIST_OBJECT_ERROR");

        // Guardar el artista en la base de datos
        const saveArtist = await artist.save();

        // Lanzar error si no se pudo guardar el artista
        if (!saveArtist) throw new Error("ARTIST_SAVE_ERROR");

        // Devolver respuesta de éxito
        res.status(200).json({
            ok: true,
            message: "Saludos desde el controlador de artistas",
            artist: saveArtist
        });
    } catch (error) {
        // Mensaje de error estandar
        let errorMessage = "There was an error creating the artist";

        // Mensaje de error personalizado: el nombre del artista es requerido
        if (error.message == "NAME_REQUIRED") errorMessage = "The name is required";

        // Mensaje de error personalizado: el objeto artista no es válido
        if (error.message == "ARTIST_OBJECT_ERROR") errorMessage = "The artist object is not valid";

        // Mensaje de error personalizado: no se pudo guardar el artista
        if (error.message == "ARTIST_SAVE_ERROR") errorMessage = "The artist could not be saved";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage,
        });
    };
};

// Obtener un artista
const one = async (req, res) => {
    try {
        // Extraer el id del artista de los parámetros de la ruta
        const artistID = req.params.id;

        // Lanzar error si no se envió el id del artista
        if (!artistID) throw new Error("ID_REQUIRED");

        // Buscar el artista en la base de datos
        const artist = await Artist.findById({"_id": artistID});

        // Lanzar error si no se encontró el artista
        if (!artist) throw new Error("ARTIST_NOT_FOUND");

        // Devolver respuesta de éxito
        res.status(200).json({
            ok: true,
            message: "Saludos desde el controlador de artistas",
            artist: artist
        });

    } catch (error) {
        // Mensaje de error estandar
        let errorMessage = "There was an error getting the artist";

        // Mensaje de error personalizado: el id del artista es requerido
        if (error.message == "ID_REQUIRED") errorMessage = "The artist ID is required";

        // Mensaje de error personalizado: no se encontró el artista
        if (error.message == "ARTIST_NOT_FOUND") errorMessage = "The artist was not found";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage,
        });
    };
};

// Obtener todos los artistas
const list = async (req, res) => {
    try {
        // Extraer pagina de los parámetros de la ruta
        const page = req.params.page || 1;

        // Opciones de paginación
        const options = {
            page,
            limit: 5,
            sort: {name: "asc"}
        }

        // Buscar los artistas en la base de datos
        const artists = await Artist.paginate({}, options);

        // Lanzar error si no se encontraron artistas
        if (!artists) throw new Error("ARTISTS_NOT_FOUND");

        // Devolver respuesta de éxito
        return res.status(200).json({
            ok: true,
            message: "Saludos desde el controlador de artistas",
            artists: artists.docs,
            totalDocs: artists.totalDocs,
            totalPages: artists.totalPages,
            page: artists.page,
        });

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error getting the artists";

        // Mensaje de error personalizado: no se encontraron artistas
        if (error.message == "ARTISTS_NOT_FOUND") errorMessage = "The artists were not found";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage,
        });
    }
}

// Actualizar un artista
const update = async (req, res) => {
    try {
        // Extraer el id del artista de los parámetros de la ruta
        const artistID = req.params.artistID;

        // Extraer los datos del artista del body
        const params = req.body;

        // Lanzar error si no se envió el id del artista
        if (!artistID) throw new Error("ID_REQUIRED");

        // Buscar el artista en la base de datos
        const artist = await Artist.findByIdAndUpdate({"_id": artistID}, params);

        // Lanzar error si no se encontró ni actualizó el artista
        if (!artist) throw new Error("ARTIST_NOT_FOUND");

        // Devolver respuesta de éxito
        res.status(200).json({
            ok: true,
            message: "Artista actualizado correctamente",
            artist: artist
        });

    } catch (error) {
        // Mensaje de error estandar
        let errorMessage = "There was an error updating the artist";

        // Mensaje de error personalizado: el id del artista es requerido
        if (error.message == "ID_REQUIRED") errorMessage = "The artist ID is required";

        // Mensaje de error personalizado: no se encontró el artista
        if (error.message == "ARTIST_NOT_FOUND") errorMessage = "The artist was not found";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage,
        });
    };
}

// Eliminar un artista
const remove = async (req, res) => {
    try {
        // Extraer el id del artista de los parámetros de la ruta
        const artistID = req.params.artistID;

        // Lanzar error si no se envió el id del artista
        if (!artistID) throw new Error("ID_REQUIRED");

        // Eliminar el artista en la base de datos
        const artist = await Artist.deleteOne({"_id": artistID});

        // Lanzar error si no se encontró ni eliminó el artista
        if (artist.deletedCount === 0) throw new Error("ARTIST_NOT_FOUND");
        
        // Eliminar los albumes del artista
        const albums = await Album.find({"artist": artistID});

        // Lanzar error si no se encontró ni eliminó el album del artista
        if (albums.length === 0) throw new Error("ALBUM_NOT_FOUND");

        // Crear un array con los id de los albumes
        const albumsID = albums.map(album => album._id);

        // Eliminar los albumes del artista incluidos en el array de albumes
        const removeAlbums = await Album.deleteMany({"_id": {$in: albumsID}});

        // Lanzar error si no se encontró o eliminaron albums del artista
        if (removeAlbums.deletedCount === 0) throw new Error("ALBUM_NOT_FOUND");

        // Eliminar las canciones sujetas a los albumes del artista
        const songs = await Song.deleteMany({"album": {$in: albumsID}});

        // Lanzar error si no se encontró ni eliminó la canción del album del artista
        if (songs.deletedCount === 0) throw new Error("SONG_NOT_FOUND");
        
        // Devolver respuesta de éxito
        res.status(200).json({
            status: "success",
            message: "Artista eliminado correctamente",
            artist: artist,
            albums: albums,
            songs: songs
        });

    } catch (error) {
        // Mensaje de error estandar
        let errorMessage = "There was an error removing the artist";

        // Mensaje de error personalizado: el id del artista es requerido
        if (error.message == "ID_REQUIRED") errorMessage = "The artist ID is required";

        // Mensaje de error personalizado: no se encontró el artista
        if (error.message == "ARTIST_NOT_FOUND") errorMessage = "The artist was not found";

        // Mensaje de error personalizado: no se encontró el album del artista
        if (error.message == "ALBUM_NOT_FOUND") errorMessage = "The artist album was not found";

        // Mensaje de error personalizado: no se encontró la canción del album del artista
        if (error.message == "SONG_NOT_FOUND") errorMessage = "The artist song was not found";

        // Mensaje de error personalizado: no se encontró ni eliminó el album del artista
        if (error.message == "ALBUM_NOT_FOUND") errorMessage = "The artist album was not found";

        // Devolver respuesta de error
        return res.status(400).json({
            status: "error",
            message: errorMessage,
        });
    };
};

// Subir avatar (foto) de un artista
const upload = async (req, res) => {
    try {
        // Extraer el id del artista de los parámetros de la ruta
        const artistID = req.params.artistID;

        // Lanzar error si no se envió el id del artista
        if (!artistID) throw new Error("ARTIST_ID_REQUIRED");

        // Extraer y separar la extension del archivo 
        const extension = req.file.originalname.split(".")[1];
        console.log(extension);

        // Listar extensiones permitidas
        const allowedExtensions = ["png", "jpg", "jpeg", "gif"];

        // Verificar que la extension del archivo es permitida
        if (!allowedExtensions.includes(extension)) {
            fs.unlinkSync(req.file.path);
            throw new Error("EXTENSION_NOT_ALLOWED");
        };

        // Actualizar imagen del usuario
        const updateImage = await Artist.findOneAndUpdate({"_id": artistID}, {"image": req.file.filename});

        // Lanzar error si no se ha podido actualizar la imagen
        if (!updateImage) {
            fs.unlinkSync(req.file.path);
            throw new Error("IMAGE_NOT_UPDATED");
        }; 

        // Devolver respuesta
        return res.status(200).json({
            status: "success",
            message: "Saludos desde el controlador de upload",
            file: req.file
        });

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error uploading the file";

        // Mensaje de error personalizado: ID de artista no proporcionado
        if (error.message == "ARTIST_ID_REQUIRED") errorMessage = "The artist ID is required";

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

// Obtener avatar (foto) de un artista
const avatar = (req, res) => {
    try {
        // Lanzar error si no se ha proporcionado el nombre del archivo
        if (!req.params.fileName) throw new Error("FILE_NOT_PROVIDED");
        
        // Ruta del archivo
        const filePath = path.join(__dirname, "../uploads/artists/" + req.params.fileName);
        
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

module.exports = {
    save,
    one,
    list,
    update,
    remove,
    upload,
    avatar
}