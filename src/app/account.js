import jwt from "jsonwebtoken";

export function signup(req, res) {
    let { username, password } = req.body;
    /* let user = forum.users.find((user) => user.username == username);
    if (user) { 
        
    } else {
        let user = {
            id: getNewId(),
            username,
            password: createHash("sha256").update(password).digest("hex"),
        };
        //forum.users.push(user);
        // ...

        let token = createJWT(user);
        res.cookie("accessToken", token, { httpOnly: true });
        res.redirect("/");
    } */
    res.redirect("/");
}

export function signin(req, res) {
    /*
    let { username, password } = req.body;
    let user = forum.users.find((user) => user.username == username);
    if (user && user.password == createHash("sha256").update(password).digest("hex")) {
        let token = createJWT(user);
        res.cookie("accessToken", token, { httpOnly: true });
        res.redirect("/");
    } else {
        res.render("account/signin", { message: "Try again. Username or password incorrect." });
    }
    */
    res.redirect("/");
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


