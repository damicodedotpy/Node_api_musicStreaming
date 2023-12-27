// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const router = require("express").Router();
// ******************************OWN LIBRARIES***********************************
const userController = require("../controllers/album");
const auth = require("../middlewares/auth");
const { albumUpload } = require("../services/multer");
// ******************************************************************************

router.post("/save", auth, userController.save);

router.get("/list/:page?/:artistID", auth, userController.list);

router.put("/update/:albumID", auth, userController.update);

router.post("/upload/:albumID", [auth, albumUpload.single("file0")], userController.upload);

router.get("/image/:albumFile", userController.image);

router.delete("/remove/:albumID", auth, userController.remove);

module.exports = router;