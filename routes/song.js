// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const router = require("express").Router();
// ******************************OWN LIBRARIES***********************************
const userController = require("../controllers/song");
const { songUpload } = require("../services/multer");
const auth = require("../middlewares/auth");
// ******************************************************************************

router.post("/save", auth, userController.save);

router.get("/one/:songID", auth, userController.one);

router.get("/list/:albumID?", auth, userController.list);

router.put("/update/:songID", auth, userController.update);

router.delete("/remove/:songID", auth, userController.remove);

router.post("/upload/:songID", [auth, songUpload.single("file0")], userController.upload);

router.get("/audio/:songFile", auth, userController.audio);

module.exports = router;