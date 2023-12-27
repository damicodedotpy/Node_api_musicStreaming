// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
// ******************************OWN LIBRARIES***********************************

// ******************************************************************************

const SongSchema = new Schema({
    album: {
        type: Schema.Types.ObjectId,
        ref: "Album",
        required: true
    },
    track: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
    },
    file: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    }
});

SongSchema.plugin(mongoosePaginate);

module.exports = model('Song', SongSchema, "songs");