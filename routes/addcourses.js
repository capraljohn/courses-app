const {Router} = require ('express')
const Course = require ('../models/course')
const auth = require ('../middleware/auth')
const {validationResult} = require ('express-validator')
const {courseValidator} = require ('../middleware/validators')
const router = Router()

router.get('/', auth, (req,res)=>{
    res.render('addcourses', {
        title: 'Add courses',
        isAdd: true, 
    })
})

router.post('/', auth, courseValidator, async (req,res)=>{
    const error = validationResult(req)
    if (!error.isEmpty()){
        return res.status(422).render('addcourses', {
            title: 'Add courses',
            isAdd: true, 
            addError: error.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
            }
        })
    }

    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userID: req.user
    })
    try{ 
        await course.save()
        res.redirect('/courses')
    }catch (e){
        console.log(e);
    }
})

module.exports = router