import express from "express";

import {getLogin, postLogin, getProfile, getEdit, uploadAvater, updateProfile, deleteAvatar, 
        getRegister, registerNewStaff, getLogout, showAllStaff, deleteStaff, changeRole} 
        from "./../controllers/staffsController.js";

import ensureAuthenticated from "../helpers/auth.js";


const router = express.Router();

// make the image folder to be static, then the image can load to HTML
router.use(express.static("views/public"));

router.route("/login").get(getLogin)
                      .post(postLogin);

router.route("/register").get(getRegister)
                         .post(registerNewStaff);

router.get("/profile", ensureAuthenticated, getProfile);

router.route("/edit").get(ensureAuthenticated, getEdit)
                     .put(ensureAuthenticated, uploadAvater, updateProfile);

router.delete("/deleteAvatar", ensureAuthenticated, deleteAvatar);

router.get("/manage", ensureAuthenticated, showAllStaff);

router.route("/:id").delete(ensureAuthenticated, deleteStaff)
                    .put(ensureAuthenticated, changeRole);

router.get("/logout", getLogout);


export default router;