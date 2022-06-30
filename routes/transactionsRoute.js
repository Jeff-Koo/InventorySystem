import express from "express";

// import functions from controller
import {showRecords, searchRecords} from "./../controllers/transactionsController.js";

import ensureAuthenticated from "../helpers/auth.js";

const router = express.Router();

// make the image folder to be static, then the image can load to HTML
router.use(express.static("views/public"));


router.get("/records", ensureAuthenticated, showRecords);

router.post("/records/search", ensureAuthenticated, searchRecords);


export default router;