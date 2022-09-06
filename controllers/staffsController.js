import bcrypt from "bcryptjs";
import passport from "passport";
import * as fs from "fs";
import Staff from "./../models/Staffs.js";
import multer from "multer";


const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename : (req, file, cb) => {
        cb(null, file.originalname)
    }
});
  
const upload = multer({ 
    storage: storage, 
    fileFilter : (req, file, cb) => {
        const mimetype = file.mimetype;
        if (
            mimetype !== "image/png" ||
            mimetype !== "image/jpg" ||
            mimetype !== "image/jpeg"||
            mimetype !== "image/gif"
        ) {
            // only accept jpeg, jpg, png, gif
            cb(null, true);
        } else {
            // not allow other file types 
            // flash an error message to user 
            req.flash("error_msg", "Wrong file type for avatar! ");
            cb(null, false);
        }
    },
});

export const uploadAvater = upload.single("avatar");

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
            avatar : staff.avatar,
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

                // two variables for storing the information of the avatar image 
                var avatarData;
                var avatarContentType;

                // if there is a file for upload 
                if (req.file) {
                    // read the temporate file and take the data of the image
                    avatarData = fs.readFileSync(req.file.path).toString("base64");
                    avatarContentType = req.file.mimetype;
                    
                    staff.avatar.data = avatarData;
                    staff.avatar.contentType = avatarContentType;

                    // delete the temporate file 
                    fs.unlink(req.file.path, (err) => {
                        if (err) throw err;
                    });
                }

                // check input : 2 input new passwords are not empty  
                if ( req.body.newPassword1 && req.body.newPassword2) {
                    // check two input password are the same
                    if (req.body.newPassword1 == req.body.newPassword2) {
                        // hash the new password and save into MongoDB
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(req.body.newPassword1, salt, (err, hash) => {
                                if (err) throw err;
                                staff.password = hash;
                                staff.save().then( ()=> {
                                    // res.render("staffs/profile", {
                                    //     text: "Updated Successfully ! ",
                                    //     avatar : staff.avatar,
                                    //     staffName : staff.staffName,
                                    //     loginName : staff.loginName,
                                    // });
                                    res.redirect("/staffs/profile")
                                });
                            });
                        });
                    } else {
                        // two input new password are not the same, so no update new password 
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
                        // res.render("staffs/profile", {
                        //     text: "Updated Successfully ! ",
                        //     avatar : staff.avatar,
                        //     staffName : staff.staffName,
                        //     loginName : staff.loginName,
                        // });
                        res.redirect("/staffs/profile")
                    });
                }

            } else {
                // wrong password 
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

export const deleteAvatar = (req, res, next) => {
    Staff.updateOne(
        { _id : res.locals.user._id },
        { $unset: { avatar : "" } }
    ).then( ()=> {
        console.log("delete avatar successfully!");
        res.redirect("/staffs/profile")
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
    Staff.find({ _id : {$ne : res.locals.user._id} })
    .lean()
    // .sort({ itemNumber: "asc" })           // show all items according to the item number in ascending order
    .then( (staffs) => {                      // staffs: array of document objects
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


export const changeRole = (req, res, next) => {
    console.log("hey is changing role");
    Staff.findOne({_id : req.params.id})
    .then( (staff)=> {
        if (req.body.role == "admin") {
            staff.isAdmin = true;
        } else {
            staff.isAdmin = false;
        }
        staff.save().then( ()=> {
            console.log("give admin role successfully!");
            res.redirect("/staffs/manage");
        });
    });
};