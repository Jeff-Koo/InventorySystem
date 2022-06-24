
// load Inventory Model
import Inventory from "../models/Inventories.js";
// load Transaction Model
import Transaction from "../models/Transactions.js";


// ===================== Read Items =======================

// inventory index route
export const showAllItems = (req, res) => {
    Inventory.find({})
        .lean()
        .sort({ itemNumber: "asc" })            // show all items according to the item number in ascending order
        .then( (items) => {                     // items: array of document objects
            res.render("inventories/index", {
                items : items,                  // items --> inventories/index.handlebars(items) : items --> array of objects from above
            });
        });
};

// search item in MongoDB with item number (should be only 1 result)
export const searchOneItem = (req, res) => {
    Inventory.findOne({
        itemNumber : req.body.itemNumber        // use findOne to return only 1 object with itemNumber
    })
    .lean()
    .then( (item) => {                          // item: the result of search
        // console.log("search result : "+item);
        res.render("inventories/search", {
            item : item,                        // item --> inventories/search(item) : item --> the search result from above
        });
    });
};


// ===================== Add New Item =======================

// render the add item page with the input form
export const getAddPage = (req, res) => {
    res.render("inventories/add");
};

// process inventory form and insert new data into MongoDB
export const insertNewItem = async(req, res) => {

    let errors = [];
    const globalRegex = new RegExp('[0-9]{3}', 'g');        // regular expression requires: a string with 3-digit number
    
    // push error message if item number is empty || not meet the regular expression requirement
    if (!req.body.itemNumber || !globalRegex.test(req.body.itemNumber)){
        errors.push({ text: "please add an item number which is a 3-digit number" });
    }

    // push error message if empty input
    if (!req.body.description){
        errors.push({ text: "please add some description" });
    }

    // push error message if quantity is empty || not a positive integer
    if (!req.body.quantity || parseInt(req.body.quantity, 10) < 0){
        errors.push({ text: "please add a positive integer for the quantity of the item" });
    }

    // if there is errors, render the page and show error messages
    if (errors.length > 0) {
        res.render(
            "inventories/add", {
                errors: errors,
                itemNumber: req.body.itemNumber,
                description: req.body.description,
                quantity: req.body.quantity, 
            });
    } else {

        // if data are good then come to here
        // use the newUser to keep the data object
        // try to add newUser into MongoDB
        try {
            let dateNow = Date.now();           // get the date time now
            let itemNumberRefFromDB = '';
            const newUser = {
                itemNumber: req.body.itemNumber,
                description: req.body.description,
                lastUpdatedDate: dateNow,
                quantity: req.body.quantity, 
            };
            await new Inventory(newUser).save().then( () => {
                console.log("save data to Inventory Schema of MongoDB")
            });


            await Inventory.findOne({
                itemNumber: req.body.itemNumber,  // use findOne to return only 1 object with ID
                lastUpdatedDate: dateNow
            })
            .then( (item) => {
                    itemNumberRefFromDB = item._id
                }
            )
            
            const newTransaction = {
                itemNumberRef: itemNumberRefFromDB,
                transactionDate: dateNow,
                updateQuantity: req.body.quantity, 
            };
            new Transaction(newTransaction).save().then( (item) => {
                console.log("save data to Transaction Schema of MongoDB")
                res.redirect("inventories");    // redirect to inventories page
            });

        } catch (err) {
            // error will occur if there is duplicated item number or other issues, 
            // then render the page and show error messages 
            errors.push({ text: "Error occurs, maybe Item Number is already being used! "});
            res.render(
                "inventories/add", {
                    errors: errors,
                    itemNumber: req.body.itemNumber,
                    description: req.body.description,
                    quantity: req.body.quantity, 
                });
        }
    }
};


// ===================== Update Item =======================

// render the page for increasing the quantity of item
export const showIncreasePage = (req, res) => {
    Inventory.findOne({
        _id: req.params.id,                     // use findOne to return only 1 object with ID
    })
    .lean()
    .then( (item) => {
        res.render('inventories/quantityIncrease', {
            item: item                          // render the page for increasing quantity for the specific item
        });
    });
};

// increase the quantity of item and update MongoDB
export const updateByIncrease = async(req, res) => {

    let dateNow = Date.now();                   // get the current date time
    let itemNumberRefFromDB = '';

    await Inventory.findOne({
        _id: req.params.id,                     // use findOne to return only 1 object with ID
    })
    .then( (item) => {
        itemNumberRefFromDB = item._id;     // get the item number for inserting into Transaction Schema

        item.quantity = parseInt(item.quantity, 10) + parseInt(req.body.quantityIncrease, 10);      // update quantity value
        item.lastUpdatedDate = dateNow;
        item.save().then( () => {
            console.log("update data in Inventory Schema of MongoDB");
        });
    });
    
    const newTransaction = {
        itemNumberRef: itemNumberRefFromDB,
        transactionDate: dateNow,
        updateQuantity: req.body.quantityIncrease, 
    };
    new Transaction(newTransaction).save().then( (item) => {
        console.log("save data to Transaction Schema MongoDB");     // save the transaction record to Transaction Schema
        res.render('finishUpdate');                                 // if success update, tell finish update
    });
};


// render the page for decreasing the quantity of item
export const showDecreasePage = (req, res) => {
    Inventory.findOne({
        _id: req.params.id,                     // use findOne to return only 1 object with ID
    })
    .lean()
    .then( (item) => {
        res.render('inventories/quantityDecrease', {
            item: item                          // render the page for decreasing quantity for the specific item
        });
    });
};

// decrease the quantity of item and update MongoDB
export const updateByDecrease = async(req, res) => {

    let dateNow = Date.now();                   // get the current date time
    let itemNumberRefFromDB = '';

    await Inventory.findOne({
        _id: req.params.id,                     // use findOne to return only 1 object with ID
    })
    .then( (item) => {
        if (parseInt(req.body.quantityDecrease, 10) > item.quantity) {
            res.render("outOfStock");           // if the number of decreasing is larger than original quantity of the item, the tell out of stock
        } else {
            itemNumberRefFromDB = item._id;

            item.quantity = parseInt(item.quantity, 10) - parseInt(req.body.quantityDecrease, 10);      // update quantity value
            item.lastUpdatedDate = dateNow;
            item.save().then( () => {
                console.log("update data in Inventory Schema of MongoDB");
            });

            
            const newTransaction = {
                itemNumberRef: itemNumberRefFromDB,
                transactionDate: dateNow,
                updateQuantity: parseInt(req.body.quantityDecrease, 10) * -1,     // make the number to be negative 
            };
            new Transaction(newTransaction).save().then( (item) => {
                console.log("save data to Transaction Schema MongoDB");     // save the transaction record to Transaction Schema
                res.render('finishUpdate');                                 // if success update, tell finish update
            });
        }
    });
};


// ===================== Delete the Item =======================
export const deleteItem = async(req, res) => {

    let itemNumberRefFromDB = '';
    let delQuantity = 0;

    await Inventory.findOne({
        _id: req.params.id,                     // use findOne to return only 1 object with ID
    })
    .then( (item) => {
        itemNumberRefFromDB = item._id;
        delQuantity -= parseInt(item.quantity, 10);     // make the number to be negative
    });
    
    const newTransaction = {
        itemNumberRef: itemNumberRefFromDB,
        transactionDate: Date.now(),            // update with the current date time
        updateQuantity: delQuantity, 
    };
    new Transaction(newTransaction).save().then( (item) => {
        console.log("save data to MongoDB")     // save the delete record to Transaction Schema
    });
    
    // after getting the information of the item, then delete
    Inventory.deleteOne({_id: req.params.id })
    .then( () => {
        console.log('success');
        res.redirect("../inventories");         // del item from Inventory Schema, and redirect to inventories page
    });
};

