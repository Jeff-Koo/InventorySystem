// add passport function to protect the route 
// connect to next middleware
export default function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error_msg", "Not Authorized");
    res.redirect("/staffs/login");
}