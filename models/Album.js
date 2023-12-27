// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
// ******************************OWN LIBRARIES***********************************

// ******************************************************************************

const AlbumSchema = new Schema({
    artist: {
        type: Schema.Types.ObjectId,
        ref: "Artist",
        required: true,
        lowercase: true
    },
    title: {
        type: String,
        required: true,
        lowercase: true
    },
    description: {
        type: String
    },
    year: {
        type: Number
    },
    image: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

AlbumSchema.plugin(mongoosePaginate);

module.exports = model("Album", AlbumSchema, "albums");