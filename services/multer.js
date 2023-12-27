// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const multer = require("multer");
const path = require("path");
// ******************************OWN LIBRARIES***********************************

// ******************************************************************************

// Clase para crear un servidor de archivos con multer y configuración personalizada
class MulterStorage {
    constructor(folderPath, filePrefix) {
        this.folderPath = folderPath;
        this.filePrefix = filePrefix;
    }

    storage() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(__dirname, `../uploads/${this.folderPath}/`));
            },
            filename: (req, file, cb) => {
                cb(null, `${this.filePrefix}-${Date.now()}-${file.originalname}`);
            }
        });
        return storage;
    }
}

// Configuración de multer: Subir archivos de imagen para Avatar de usuario
const userUpload = multer({ storage: new MulterStorage("../uploads/avatars/", "avatars").storage() });

// Configuración de multer: Subir archivos de imagen para foto de Artistas
const artistUpload = multer({ storage: new MulterStorage("../uploads/artists/", "artist").storage() });

// Configuración de multer: Subir archivos de imagen para foto portada de Albumes
const albumUpload = multer({ storage: new MulterStorage("../uploads/albums/", "album").storage() });

// Configuración de multer: Subir archivos de audio para canciones
const songUpload = multer({ storage: new MulterStorage("../uploads/songs/", "song").storage() });

module.exports = {
    userUpload,
    artistUpload,
    albumUpload,
    songUpload
}