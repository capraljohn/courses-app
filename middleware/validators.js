const {body} = require ('express-validator')
const User = require ('../models/user')

exports.registerValidator = [
    body('name').isLength({min:2}).withMessage('Name must be min 2 characters'),

    body('password', 'Password must be min 3 characters')
    .isLength({min:3,max:25}).isAlphanumeric().trim(),

    body('confirm')
    .custom((value,{req})=>{
        if (value !== req.body.password){
            throw new Error('Password do not match')
        }
        return true
    }).trim(),

    body('email').isEmail().withMessage('Enter correct email')
    .custom(async (value,{req})=>{
        try {
            const user = await User.findOne({email: value})
            if (user){
                return Promise.reject('This email is busy')
            }
        } catch (e) {
            console.log(e)
        }
    }).normalizeEmail()
]

exports.loginValidator = [
    body('email').isEmail().withMessage('Enter correct email').normalizeEmail(),
    body('password', 'Incorrect password').isAlphanumeric().trim()
]

exports.courseValidator = [
    body('title').isLength({min:3}).withMessage('Title must be min 3 characters').trim(),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('img', 'Enter correct URL for the imaige').isURL()
]