import express from "express";

import {getLogin, postLogin, getProfile, getEdit, updateProfile, 
        getRegister, registerNewStaff, getLogout, showAllStaff, deleteStaff} 
        from "./../controllers/staffsController.js";

import ensureAuthenticated from "../helpers/auth.js";

const router = express.Router();

router.route("/login").get(getLogin).post(postLogin);

router.get("/profile", ensureAuthenticated, getProfile);

router.route("/edit").get(ensureAuthenticated, getEdit).put(ensureAuthenticated, updateProfile);

router.route("/register").get(getRegister).post(registerNewStaff);

router.get("/logout", getLogout);

router.get("/manage", showAllStaff);

router.delete("/:id", deleteStaff);

export default router;