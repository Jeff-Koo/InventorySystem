import express from "express";

import {getLogin, postLogin, getProfile, getEdit, updateProfile, 
        getRegister, registerNewStaff, getLogout, showAllStaff, deleteStaff} 
        from "./../controllers/staffsController.js";

import ensureAuthenticated from "../helpers/auth.js";

import multer from "multer"

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname)
    }
});
  
var upload = multer({ storage: storage });

const router = express.Router();

// make the image folder to be static, then the image can load to HTML
router.use(express.static("views/public"));

router.route("/login").get(getLogin)
                      .post(postLogin);

router.route("/register").get(getRegister)
                         .post(registerNewStaff);

router.get("/profile", ensureAuthenticated, getProfile);

router.route("/edit").get(ensureAuthenticated, getEdit)
                     .put(ensureAuthenticated, upload.single("avatar"), updateProfile);

router.get("/manage", ensureAuthenticated, showAllStaff);

router.delete("/:id", ensureAuthenticated, deleteStaff);

router.get("/logout", getLogout);


export default router;