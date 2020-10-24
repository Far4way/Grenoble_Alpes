const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models/index");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.cookies.accessToken;
    if (!token) {
        return res.status(403).send("Veuillez vous <a href='./'>identifier</a> pour accéder à cette page.");
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send("Unauthorized, veuillez vous <a href='./'>identifier</a> à nouveau pour accéder à cette page.");
        }
        req.userId = decoded.id;
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send("Vous devez posséder le rôle d\'administrateur pour accéder à cette page :  <a href='./user'>page utilisateur.</a> ");
            }
        );
    });
};

const authJwt = {
    verifyToken,
    isAdmin,
};
module.exports = authJwt;
