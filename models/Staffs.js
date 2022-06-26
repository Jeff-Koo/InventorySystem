// create model according to mogoose structure
// create schema object with props.

import mongoose from "mongoose";
const {Schema} = mongoose;

const StaffSchema = new Schema( { 
    loginName: {
        type : String,
        required : true,
    },
    password: {
        type : String,
        required : true,
    },
    staffName: {
        type : String,
        required : true,
    },
});

const Staff = mongoose.model("staffs", StaffSchema);

export default Staff;