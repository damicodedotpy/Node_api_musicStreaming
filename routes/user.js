// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const router = require("express").Router();
// ******************************OWN LIBRARIES***********************************
const { userUpload } = require("../services/multer");
const userController = require("../controllers/user");
const auth = require("../middlewares/auth");
// ******************************************************************************

router.post("/register", userController.register);

router.get("/login", userController.login);

router.get("/profile/:id", auth, userController.profile);

router.put("/update", auth, userController.update);

router.post("/upload", [auth, userUpload.single("file0")], userController.upload);

router.get("/avatar/:fileName", userController.avatar);

module.exports = router;