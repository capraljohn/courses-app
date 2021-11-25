const {Schema, model} = require ('mongoose')

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: String,
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}) 

courseSchema.method('isClient', function(){
    const course = this.toObject()

    course.id = course._id
    delete course._id
    
    return course 
})

module.exports = model('Course', courseSchema)