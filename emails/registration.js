const keys = require ('../keys')


module.exports = function(email){
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Account has been createde',
        html: `
            <h1>Welcome to own shop</h1>
            <p>You account has been success created with email - ${email}</p>
            <hr>
            <a href="${keys.BASE_URL}">Courses app</a>
            
        `
}
}