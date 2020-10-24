const { verifySignUp } = require("../middlewares");
const { authJwt } = require("../middlewares");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/signup",[
            verifySignUp.checkDuplicateUsername,
            verifySignUp.checkRolesExisted
        ],authController.signup
    );

    app.post("/signin", authController.signin);

    app.get("/user", [authJwt.verifyToken], userController.userBoard);

    app.get("/admin",[authJwt.verifyToken, authJwt.isAdmin],userController.adminBoard);

    app.get("*", userController.allAccess);

};
