import express from "express";

// import functions from controller
import {showAllItems, insertNewItem, searchOneItem, getAddPage, 
    showIncreasePage, updateByIncrease, showDecreasePage, updateByDecrease, deleteItem} 
    from "./../controllers/inventoriesController.js";

import ensureAuthenticated from "../helpers/auth.js";

const router = express.Router();


// make the image folder to be static, then the image can load to HTML
router.use(express.static("views/public"));

router.route("/").get(ensureAuthenticated, showAllItems)
                 .post(ensureAuthenticated, insertNewItem);

router.post("/search", ensureAuthenticated, searchOneItem);

router.get("/add", ensureAuthenticated, getAddPage);

router.route("/quantityIncrease/:id").get(ensureAuthenticated, showIncreasePage)
                                     .put(ensureAuthenticated, updateByIncrease);

router.route("/quantityDecrease/:id").get(ensureAuthenticated, showDecreasePage)
                                     .put(ensureAuthenticated, updateByDecrease);

router.delete("/:id", ensureAuthenticated, deleteItem);


export default router;