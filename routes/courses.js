const {Router} = require ('express')
const Course = require ('../models/course')
const {validationResult} = require ('express-validator')
const {courseValidator} = require ('../middleware/validators')
const auth = require ('../middleware/auth')
const router = Router()

function isOwner(course, req){
    return course.userID.toString() === req.user._id.toString()
}

router.get('/', async (req,res)=>{   
  try {
    const courses = await Course.find() 
    .populate('userID','email name')
    .select('price title img')

    res.render('courses', {
        title: 'Courses',
        isCourses: true,
        userID: req.user ? req.user._id.toString() : null,
        courses
    }) 
  } catch (e) {
      console.log(e)
  }
})


router.get('/:id/edit', auth, async (req,res)=>{
    if (!req.query.allow) {
        return res.redirect('/')
    }
    try {
        const course = await Course.findById(req.params.id)
 
        if (!isOwner(course, req)){
            return res.redirect('/courses')
        }
    
        res.render('course-edit',{
            title: `Redact ${course.title}`,
            course
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/remove',auth, async (req,res)=>{
   try {
        await Course.deleteOne({
            _id: req.body.id,
            userID: req.user._id
        })
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
}
})


router.post('/edit', auth, courseValidator, async (req,res)=>{
    const error = validationResult(req)

    if (!error.isEmpty()){
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
    try {
        const {id} = req.body
        delete req.body.id
        const course = await Course.findById(id)
        
        if (!isOwner(course,req)){
            return res.redirect('/courses')
        }
        Object.assign(course, req.body)
        await course.save() 
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req,res)=>{
    const course = await Course.findById(req.params.id)
    res.render('course', {
        layout: 'empty',
        title: `Course`,
        course

    })
})

module.exports = router  