// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const {Schema, model} = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
// ******************************OWN LIBRARIES***********************************

// ******************************************************************************
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: String,
    nick: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        default: "role_user"
    },
    image: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
});

UserSchema.plugin(mongoosePaginate);

module.exports = model("User", UserSchema, "users");

