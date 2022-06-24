import express from "express";

// import functions from controller
import {showRecords, searchRecords} from "./../controllers/transactionsController.js";

const router = express.Router();

router.get("/records", showRecords);
router.post("/records/search", searchRecords);


export default router;