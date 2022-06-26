import {Strategy as LocalStrategy} from "passport-local";
import bcrypt from "bcryptjs";
import Staff from "../models/Staffs.js"


export default function (passport) {
    passport.use(
        new LocalStrategy( { usernameField : "loginName" }, (loginName, password, done) => {
            // console.log(loginName, password);        // if it is working then should console the variable
            // Match staff based on loginName
            Staff.findOne({
                email : loginName,
            }).then( (staff) => {
                if (!staff) {
                    // done function    error,        user,                                      {message}
                    //                  error = null, user = false(no staff) don't return staff, {message}
                    return done(null, false, { message : "No Staff Found" });
                }
                // after staff is found then check password
                // Match password
                // compare input password vs MongoDB staff password
                bcrypt.compare(password, staff.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, staff);
                    } else {
                        return done(null, false, { message : "Password Incorrect" })
                    }
                });
            });
        })
    );


    // for session use, to maintain cookies in server
    passport.serializeUser(function (staff, done) {
        done(null, staff.id);
    });
    
    passport.deserializeUser(function (id, done) {
        Staff.findById(id, function (err, staff) {
            done(err, staff);
        });
    });
}


