const keys = require ('../keys')


module.exports = function(email){
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Recovery',
        html: `
            <h1>Your password has been successfully changed</h1>
            
            <hr>
            <a href="${keys.BASE_URL}">Courses app</a>
            
        `
}
}