// create model according to mogoose structure
// create schema object with props.

import mongoose from "mongoose";
const {Schema} = mongoose;

const TransactionSchema = new Schema( { 
    itemNumber: {
        type : String,
        required : true,
    },
    transactionDate : {
        type : Date,
        default : Date.now,
    },
    updateQuantity : {
        type : Number,      // can be positive and negative
        required : true,
    },
});

const Transaction = mongoose.model("transactions", TransactionSchema);

export default Transaction;