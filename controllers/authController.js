
exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
});

exports.getLogout = (req, res) => {
    req.logout();
    res.redirect('/');
};
