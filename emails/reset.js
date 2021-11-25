const keys = require ('../keys')


module.exports = function(email, token){
    return {
        to: email, 
        from: keys.EMAIL_FROM,
        subject: 'Password recovery',
        html: `
            <h1></h1>
            <p>If you have not sent your request, please ignore this email</p>
            <p>If so, click on the link below</p>
            <hr>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Recover</a></p>
            
        `
}
}