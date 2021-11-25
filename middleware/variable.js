module.exports = function(req,res,next){
    res.locals.isAuth = req.session.isAutentification
    res.locals.csrf = req.csrfToken()

    next()
} 