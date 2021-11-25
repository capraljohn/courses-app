const {Router} = require ('express')
const Order = require ('../models/order')
const auth = require ('../middleware/auth')
const router = Router()

router.get('/', auth, async (req,res)=>{
    try{
        const orders = await Order.find({'user.userID': req.user._id})
        .populate('user.userID')
    
    res.render('orders',{
        isOrder: true,
        title: 'Orders',
        orders: orders.map(o=>{
            return {
                ...o._doc,
                price: o.courses.reduce((total, cou)=>{
                    return total += cou.count * cou.course.price
                },0) 
            }
        })
    })
} catch (e){
    console.log(e);
}
})

router.post('/', auth, async (req,res)=>{
    try {
        const user = await req.user.populate('cart.items.courseID')

        const courses = user.cart.items.map(i =>({
        count: i.count,
        course: {...i.courseID._doc}
    }))
      const order = new Order({
          user: {
              name: req.user.name,
              userID: req.user
          },
          courses: courses
      })   
      await order.save()
      await req.user.clearCart()

    res.redirect('/orders')
    } 
    catch (e){
        console.log(e);
    }
})

module.exports = router 