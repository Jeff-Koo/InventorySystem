// create model according to mogoose structure
// create schema object with props.

import mongoose from "mongoose";
const {Schema} = mongoose;

const InventorySchema = new Schema( { 
    itemNumber: {
        type : String,
        required : true,
        unique: true
    },
    description : {
        type : String,
        required : true,
    },
    lastUpdatedDate : {
        type : Date,
        default : Date.now,
    },
    quantity : {
        type : Number,
        required : true,
    },
} );

const Inventory = mongoose.model("inventories", InventorySchema);

export default Inventory;