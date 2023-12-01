import express from "express";
import createError from "http-errors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import * as routes from "./routes.js";

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

export const app = express();
const publicPath = fileURLToPath(new URL("./public", import.meta.url));

app
    .use(morgan("dev"))
    .use(express.static(publicPath))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use((req, res, next) => { console.log("query =", req.query); next(); })
    .use((req, res, next) => { console.log("body =", req.body); next(); })
    // views
    .set("views", fileURLToPath(new URL("./views", import.meta.url)))
    .set("view engine", "ejs")
    // Token
    .use(cookieParser()) // peuple req.cookies
    .use(routes.auth) // initialise res.locals.user
    // PUT & DELETE
    .use(methodOverride("_method"))
    /* routes */
    // GET
    .get("/", routes.index)
    .get("/account/signin", routes.getSigninPage)
    .get("/account/signup", routes.getSignupPage)
    .get("/account/signoff", routes.logoff)
    .get("/sheet/new", routes.getCreateSheetPage)
    .get("/sheet/:sheetId", routes.showSheet)
    // POST
    .post("/", routes.index)
    .post("/account/signin", routes.login)
    .post("/account/signup", routes.register)
    .post("/account/signoff", routes.logoff)
    .post("/sheet/new", routes.newSheet)
    // PUT
    .put("/sheet/:sheetId", routes.editSheet)
    .put("/sheet/users/:sheetId", routes.editSheetUsers)
    .put("/sheet/rename/:sheetId", routes.editSheetName)
    // DELETE
    .delete("/sheet/:sheetId", routes.removeSheet)
    //
    .use((req, res, next) => next(createError(404)))
    .use((err, req, res, next) => res.send(`<h1>${err.message}</h1>`));