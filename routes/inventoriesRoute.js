import express from "express";

// import functions from controller
import {showAllItems, insertNewItem, searchOneItem, getAddPage, 
    showIncreasePage, updateByIncrease, showDecreasePage, updateByDecrease, deleteItem} from "./../controllers/inventoriesController.js";

const router = express.Router();


router.route("/").get(showAllItems).post(insertNewItem);

router.post("/search", searchOneItem);

router.get("/add", getAddPage);


router.route("/quantityIncrease/:id").get(showIncreasePage).put(updateByIncrease);

router.route("/quantityDecrease/:id").get(showDecreasePage).put(updateByDecrease);

router.delete("/:id", deleteItem);

export default router;