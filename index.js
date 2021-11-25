const express = require ('express')
const path = require ('path')
const mongoose = require ('mongoose')
const helmet = require ('helmet')
const compression = require ('compression')
const flash = require ('connect-flash')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const exhbs = require ('express-handlebars')
const session = require ('express-session')
const MongoStore = require ('connect-mongodb-session')(session)
const csrf = require ('csurf')
const routerHome = require('./routes/home')
const routerCard = require('./routes/card')
const routerCourses = require('./routes/courses')
const routerAddCourses = require('./routes/addcourses')
const routerOrders = require ('./routes/orders')    
const routerAuth = require('./routes/auth')
const routerProfile = require ('./routes/profile')
const middleware = require ('./middleware/variable')
const userMiddleware = require ('./middleware/user')
const fileMiddleware = require ('./middleware/filewors')
const errorNotFound = require ('./middleware/error404')
const keys = require ('./keys')



const store = new MongoStore({
    collection: 'session', 
    uri: keys.MONGODB_URI,
      
})
const app = express()

const hbs = exhbs.create({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main', 
    extname: 'hbs',
    helpers: require ('./middleware/hbs-helper')
})

app.engine('hbs', hbs.engine)  
app.set('view engine', 'hbs')
app.set('views', 'views')  
   

app.use(express.static(path.join(__dirname,'public')))
app.use('/images', express.static(path.join(__dirname,'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: keys.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store
 
}))

app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(compression())
app.use(helmet({
    contentSecurityPolicy: false
}))
app.use(middleware)
app.use(userMiddleware)

app.use('/',routerHome)
app.use('/courses',routerCourses)
app.use('/addcourses',routerAddCourses) 
app.use('/card', routerCard)
app.use('/orders', routerOrders)
app.use('/auth', routerAuth)
app.use('/profile', routerProfile)

app.use(errorNotFound)

// process.on('uncaughtException', (e) => {
//     console.error(e)
// })


async function start(){
    try {
        await mongoose.connect(keys.MONGODB_URI,{useNewUrlParser: true, })

        const PORT = process.env.PORT || 3000
        app.listen(PORT, ()=>{
            console.log(`Server has been started on port ${PORT}`);
        }) 
    } catch (e){
        console.log(e); 
    }
} 
start()
   