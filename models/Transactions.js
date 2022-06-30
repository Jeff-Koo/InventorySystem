// create model according to mogoose structure
// create schema object with props.

import mongoose from "mongoose";
const {Schema} = mongoose;

const TransactionSchema = new Schema( { 
    itemNumberRef: {
        type : mongoose.Types.ObjectId,
        required : true,
    },
    transactionDate : {
        type : Date,
        default : Date.now,
    },
    updateQuantity : {
        type : String,      // can be positive and negative
        required : true,
    },
    staffRef: {
        type : mongoose.Types.ObjectId,
        required : true,
    }
});

const Transaction = mongoose.model("transactions", TransactionSchema);

export default Transaction;