import bcrypt from "bcryptjs";
import passport from "passport";
import Staff from "./../models/Staffs.js";

export const getLogin = (req, res, next) => {
    res.render("staffs/login");
};

export const postLogin = (req, res, next) => {
    passport.authenticate("local", {            // local follow  {Strategy as LocalStrategy} from "passport-local" 
        successRedirect : "/",
        failureRedirect : "/staffs/login",
        failureFlash : true,                    // turn on the Flash, to make error_msg
    })(req, res, next);                         // IIFE 
};

export const getProfile = (req, res, next) => {
    Staff.findOne({_id : res.locals.user._id})
    .lean()
    .then( (staff) => {
        res.render("staffs/profile", {
            staffName : staff.staffName,
            loginName : staff.loginName,
        });
    });
};

export const getEdit = (req, res, next) => {
    Staff.findOne({_id : res.locals.user._id})
    .lean()
    .then( (staff) => {
        res.render("staffs/edit", {
            staffName : staff.staffName,
        });
    });
};

export const updateProfile = (req, res, next) => {
    Staff.findOne({_id : res.locals.user._id})
    .then( (staff) => {
        // check password correct or not 
        bcrypt.compare(req.body.oldPassword, staff.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                // correct password, then do update 
                staff.staffName = req.body.staffName;

                // check input : 2 input new passwords are not empty  
                if ( req.body.newPassword1 && req.body.newPassword2) {
                    // check two input password are the same
                    if (req.body.newPassword1 == req.body.newPassword2) {
                        console.log("new passwords are the same")
                        // hash the new password and save into MongoDB
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(req.body.newPassword1, salt, (err, hash) => {
                                if (err) throw err;
                                console.log("hash value : ", hash);
                                staff.password = hash;

                                staff.save().then( ()=> {
                                    res.render("staffs/profile", {
                                        text: "Updated Successfully ! ",
                                        staffName : staff.staffName,
                                        loginName : staff.loginName,
                                    });
                                });
                            });
                        });
                    } else {
                        // two input new password are not the same, so no update new password 
                        console.log("wrong password, cannot update ");
                        res.render("staffs/edit", {
                            text : "New Password are not the same ! ",
                            staffName : req.body.staffName,
                            oldPassword : req.body.oldPassword,
                            newPassword1 : req.body.newPassword1,
                            newPassword2 : req.body.newPassword2,
                        });
                    }
                } else {
                    staff.save().then( ()=> {
                        res.render("staffs/profile", {
                            text: "Updated Successfully ! ",
                            staffName : staff.staffName,
                            loginName : staff.loginName,
                        });
                    });
                }

            } else {
                // wrong password 
                console.log("wrong password, cannot update ");
                res.render("staffs/edit", {
                    text : "wrong password, cannot update staff profile ! ",
                    staffName : req.body.staffName,
                    oldPassword : req.body.oldPassword,
                    newPassword1 : req.body.newPassword1,
                    newPassword2 : req.body.newPassword2,
                });
            }
        });
    });
};

export const getRegister = (req, res, next) => {
    res.render("staffs/register");
};

export const registerNewStaff = (req, res, next) => {
    let errors = [];
    if (!req.body.staffName) {
        errors.push({text: "Name is missing ! "});
    }
    if (!req.body.loginName) {
        errors.push({text: "Login Name is missing ! "});
    }
    if (req.body.password != req.body.password2) {
        errors.push({text: "Passwords do not match"});
    }
    if (req.body.password.length < 4) {
        errors.push({text: "Password must be at least 4 characters"});
    }
    if (errors.length > 0) {
        res.render("staffs/register", {
            errors : errors,
            staffName : req.body.staffName,
            loginName : req.body.loginName,
            password : req.body.password,
            password2 : req.body.password2,
        });
    } else {
        Staff.findOne({loginName: req.body.loginName}).then( (staff) => {
            if (staff) {
                req.flash("error_msg", "Login Name already regsitered ! ");
                res.render("staffs/register", {
                    errors : errors,
                    // staffName : req.body.staffName,
                    // loginName : req.body.loginName,
                    // password : req.body.password,
                    // password2 : req.body.password2,
                })
            }
        });
        
        const newStaff = new Staff({
            staffName : req.body.staffName,
            loginName : req.body.loginName,
            password : req.body.password,
        });
        // 10 char long
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newStaff.password, salt, (err, hash) => {
                if (err) throw err;
                newStaff.password = hash;
                newStaff.save()
                    .then( (user) => {
                        // req.flash("success_msg", "Regsiter Done ! ");
                        res.redirect("/staffs/manage");
                    })
                    .catch((err) => {
                        console.log(err);
                        return;
                    });
            });
        });
    }
};

export const getLogout = (req, res, next) => {
    req.logout( (err) => {
        if (err) throw err; 
    });
    res.redirect("/")
};


export const showAllStaff = (req, res, next) =>{
    Staff.find({})
    .lean()
    // .sort({ itemNumber: "asc" })           // show all items according to the item number in ascending order
    .then( (staffs) => {                      // staffs: array of document objects
        console.log(staffs);
        res.render("staffs/manage", {
            staffs : staffs,
        });
    });
};


export const deleteStaff = (req, res, next) => {
    Staff.deleteOne({_id: req.params.id })
    .then( () => {
        console.log('deleted successfully');
        res.redirect("/staffs/manage");         // del item from Inventory Schema, and redirect to inventories page
    });
};