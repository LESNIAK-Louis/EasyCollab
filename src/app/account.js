import jwt from "jsonwebtoken";
import User from "./user.js"
import { easycollab } from "../routes.js"
import * as crypto from "crypto"
import dotenv from "dotenv";

dotenv.config();

export async function signup(req, res) {

    if(!req.body || !req.body.username || !req.body.password){
        res.setStatus(400);
    }

    let { username, password } = req.body;

    let user = easycollab.users[username];
    if(user){
        res.render("account/signup", { message: "<p>Ce nom n'est pas disponible.</p>" });
    }else{
        try{
            user = new User(username, crypto.createHash("sha256").update(password).digest("hex"));
            easycollab.users[username] = user;
            easycollab.save();
        } catch(e) {
            console.log(e);
            res.setStatus(500); return; 
        }

        let token = createJWT(user);
        res.cookie("accessToken", token, { httpOnly: true });
        res.redirect("/");
    }
}

export async function signin(req, res) {

    if(!req.body || !req.body.username || !req.body.password){
        res.setStatus(400); return;
    }

    let { username, password } = req.body;

    let user = easycollab.users[username];
    if(user && crypto.createHash("sha256").update(password).digest("hex") == user.password){
        let token = createJWT(user);
        res.cookie("accessToken", token, { httpOnly: true });
        res.redirect("/");
    }else{
        res.render("account/signin", { message: "<p>Username or password incorrect.</p>"});
    }
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
        { username: user.username }, // données à crypter
        process.env.SECRET, // clé de chiffrement
        { expiresIn: "7d" }, // durée de validité du jeton, ici une semaine
    );
}


