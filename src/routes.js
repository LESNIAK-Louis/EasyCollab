import { authenticate, signin, signoff, signup } from "./app/account.js";

export function index(req, res) { res.render("index"); }

export function auth(req, res, next) { authenticate(req, res, next); }

export function getSigninPage(req, res) { res.render("account/signin"); }

export function login(req, res) { signin(req,res); }

export function logoff(req, res) { signoff(req,res); }

export function getSignupPage(req, res) {res.render("account/signup"); }

export function register(req, res) { signup(req,res); }

