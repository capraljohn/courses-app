const {Router} = require ('express')
const User = require ('../models/user')
const bcrypt = require ('bcryptjs')
const crypto = require ('crypto')
const {validationResult} = require ('express-validator')
const sendgrid = require ('nodemailer-sendgrid-transport')
const nodemailer = require ('nodemailer')
const sendMail = require ('../emails/registration')
const keys = require ('../keys')
const resetPassword = require ('../emails/reset')
const successReset = require ('../emails/successreset')
const {registerValidator} = require ('../middleware/validators')
const {loginValidator} = require ('../middleware/validators')
const router = Router()

const transport = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/login',async (req,res)=>{
    res.render('auth/login',{
        title: 'Login',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.get('/logout', async (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/auth/login#login')
    })
    
}) 

router.post('/login', loginValidator, async (req,res)=>{
    const error = validationResult(req)
    if (!error.isEmpty()){
        req.flash('loginError', error.array()[0].msg)
        return res.status(422).redirect('/auth/login#login')
    }
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})

        if (candidate){
            const isPass = await bcrypt.compare(password, candidate.password)

            if (isPass){
                req.session.user = candidate
                req.session.isAutentification = true
                req.session.save(err=>{
                if (err){ 
                    throw err
                } 
                res.redirect('/')  
            })
            } else {
                req.flash('loginError', 'Incorrect password')
                res.redirect('/auth/login#login')
            } 
    
        } else {
            req.flash('loginError', 'Incorrect email')
            res.redirect('/auth/login#login')
        } 
    } catch (e) {
        console.log(e);
    }
}) 
 
router.post('/register', registerValidator, async (req,res)=>{
    try {
        const {email, name, password} = req.body

        const error = validationResult(req)
        if (!error.isEmpty()){
            req.flash('registerError', error.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }
            const code = await bcrypt.hash(password, 10)
            const user = new User({
                email,name,password: code,cart: {item:[]}
            })
            await user.save()
            await transport.sendMail(sendMail(email))
            res.redirect('/auth/login#login')
            
    } catch (e) {
        console.log(e);
    }
})

router.get('/reset', (req,res)=>{
    res.render('auth/reset', {
        title: "Password recovery",
        resetError: req.flash('resetError')
    })
})

router.get('/password/:token', async (req,res)=>{
    if (!req.params.token){
        return res.redirect('/auth/login')
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })
        
        if (!user){
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: "Access recovery",
                resetError: req.flash('resetError'),
                userID: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/reset', (req,res)=>{
    try {
        crypto.randomBytes(32, async (err,buffer)=>{
            if (err){
                req.flash('resetError', 'Someting went wrong, please, try again')
                return res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex')

            const candidate = await User.findOne({email: req.body.email})

            if (candidate){
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transport.sendMail(resetPassword(candidate.email, token))
                res.redirect('/auth/login')

            } else {
                req.flash('resetError', 'Email is not defined')
                res.redirect('/auth/reset')
            }
        })
    } catch (e) {
        console.log(e);
    }
})

router.post('/password', async (req,res)=>{
    try {
        const user = await User.findOne({
            _id: req.body.userID,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        }) 
        if (user){
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined

            await user.save() 
            await transport.sendMail(successReset(user.email))
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'The time allotted for changes has expired')
            res.redirect('/auth/login')
        }
    } catch (e) { 
        console.log(e)
    }
})
    
module.exports = router
 