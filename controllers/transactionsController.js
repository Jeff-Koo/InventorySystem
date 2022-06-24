
// load Transaction Model
import Transaction from "../models/Transactions.js";

// ===================== Read Transaction Records =======================

// show all Transaction Records 
export const showRecords = (req, res) => {

    Transaction.aggregate([                     // join two schema to get detail of each item (e.g. description of item)
        { $lookup:
            {
                from: "inventories",            // link Transaction collection and Inventory collection 
                localField: "itemNumberRef",
                foreignField: "_id",            // link collections base on _id of MongoDB 
                as: "detail",
            }
        },
        { $unwind: {
                path: "$detail",
                preserveNullAndEmptyArrays: true
            }
        },
        { $project:                             // name the attributes
            {
                itemNumberRef : "$itemNumberRef",
                itemNumber : "$detail.itemNumber",
                description: "$detail.description",
                transactionDate: {
                    $dateToString : {           // format the date format 
                        format : "%Y-%m-%d %H:%M:%S", 
                        date : "$transactionDate",
                        timezone:"+0800",
                    }
                },
                updateQuantity : "$updateQuantity",
            }
        },
        { $sort :                               // show all records: item number in ascending order & transaction date in ascendeing order
            { 
                "itemNumber" : 1 ,
                "itemNumberRef" : 1 ,           // there is no itemNumber for the deleted items
                "transactionDate": 1
            }
        },
    ])
    .then( (records) => {                       // records: array of document objects
        console.log(records);
        res.render("transactions/records", {
            records : records,                  // records --> transactions/index.handlebars(records) : records --> array of objects from above
        });
    });
};


// show Transaction Records in specific date range
export const searchRecords = (req, res) => {
    
    Transaction.aggregate([                     // join two schema to get detail of each item (e.g. description of item)
        { $lookup:
            {
                from: "inventories",            // link Transaction collection and Inventory collection 
                localField: "itemNumberRef",
                foreignField: "_id",            // link collections base on _id of MongoDB 
                as: "detail",
            }
        },
        { $unwind: {
                path: "$detail",
                preserveNullAndEmptyArrays: true
            }
        },
        { $match :
            {transactionDate: { 
                    // make the query time from 00:00:00.000 to 23:59:59.999 in GMT+08:00, and filter records in MongoDB 
                    $gte: new Date(req.body.startDate + "T00:00:00.000"),
                    $lte: new Date(req.body.endDate   + "T23:59:59.999"),
                }
            }
        }, 
        { $sort :                               // show all records: item number in ascending order & transaction date in ascendeing order
            {
                "itemNumber" : 1 , 
                "itemNumberRef" : 1 ,           // there is no itemNumber for the deleted items
                "transactionDate": 1
            } 
        },
        { $project:                             // name the attributes
            {
                itemNumberRef : "$itemNumberRef",
                itemNumber : "$detail.itemNumber",
                description: "$detail.description",
                transactionDate: {
                    $dateToString : {           // format the date format 
                        format : "%Y-%m-%d %H:%M:%S", 
                        date : "$transactionDate",
                        timezone:"+0800",
                    }
                },
                updateQuantity : "$updateQuantity",
            }
        }
        
    ])
    .then( (records) => {                       // records: array of document objects
        console.log(records);
        res.render("transactions/records", {
            records : records,                  // records --> transactions/index.handlebars(records) : records --> array of objects from above
            startDate : req.body.startDate,
            endDate : req.body.endDate,
        });
    });
};