import jwt from "jsonwebtoken";
import User from "../db/schemas/schemaUser.js"
import * as crypto from "crypto"

export async function signup(req, res) {
    let { username, password } = req.body;

    await User.findOne({username: username})
    .then((user) => {
        if(user){
            res.render("account/signup", { message: "<p>Username already taken !</p>" });
            return;
        }

        const userObj = new User({
            username: username,
            password: crypto.createHash("sha256").update(password).digest("hex")
        });

        userObj.save().catch((err) => { 
            console.log("Failed to register user '" + username + "', error : " + err); 
        });

        let token = createJWT(userObj);
        res.cookie("accessToken", token, { httpOnly: true });
        res.redirect("/");
        
    })
    .catch((err) => {
            console.log("Failed to retreive user '" + username + "', error : " + err); 
            res.render("account/signup");
            return;
    });
}

export async function signin(req, res) {
    let { username, password } = req.body;

    await User.findOne({username: username})
    .then((user) => {

        if(user){
            if(crypto.createHash("sha256").update(password).digest("hex") == user.password){
                let token = createJWT(user);
                res.cookie("accessToken", token, { httpOnly: true });
                res.redirect("/");
                return;
            }
        }

        res.render("account/signin", { message: "<p>Username or password incorrect.</p>"});
        
    })
    .catch((err) => {
            console.log("Failed to retreive user '" + username + "', error : " + err); 
            res.render("account/signin");
            return;
    });
}

export function signoff(req, res) {
    res.cookie("accessToken", null);
    res.redirect("/");
}

export function authenticate(req, res, next) {
    try {
        let token = req.cookies.accessToken;
        let user = jwt.verify(token, process.env.SECRET);
        res.locals.user = user;
    } catch {}
    next();
}

function createJWT(user) {
    return jwt.sign(
        { id: user.id, username: user.username }, // données à crypter
        process.env.SECRET, // clé de chiffrement
        { expiresIn: "7d" }, // durée de validité du jeton, ici une semaine
    );
}


