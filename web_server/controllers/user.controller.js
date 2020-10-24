exports.allAccess = (req, res) => {
    res.render('SignIn.html');
};

exports.userBoard = (req, res) => {
    res.render('user.html');
};

exports.adminBoard = (req, res) => {
    res.render('admin.html');
};