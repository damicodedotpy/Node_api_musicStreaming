// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const router = require("express").Router();
// ******************************OWN LIBRARIES***********************************
const userController = require("../controllers/artist");
const auth = require("../middlewares/auth");
const { artistUpload } = require("../services/multer");
// ******************************************************************************

router.post("/save", auth, userController.save);

router.get("/one/:id", auth, userController.one);

router.get("/list/:page?", auth, userController.list);

router.put("/update/:artistID", auth, userController.update);

router.delete("/remove/:artistID", auth, userController.remove);

router.post("/upload/:artistID", [auth, artistUpload.single("file0")], userController.upload);

router.get("/avatar/:fileName", userController.avatar);

module.exports = router;