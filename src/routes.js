import { authenticate, signin, signoff, signup } from "./app/account.js";
import { createSheet, editData, remove, renderSheet, editUsers, renameSheet, subscribe, update, unSubscribe, getListUsersOnPage } from "./app/sheet.js";
import EasyCollab from "./app/easycollab.js";

export let easycollab = new EasyCollab();
easycollab.load();

export function index(req, res) { res.render("index", easycollab); }

export function auth(req, res, next) { authenticate(req, res, next); }

export function getSigninPage(req, res) { res.render("account/signin"); }

export function login(req, res) { signin(req,res); }

export function logoff(req, res) { signoff(req,res); }

export function getSignupPage(req, res) {res.render("account/signup"); }

export function register(req, res) { signup(req,res); }

export function getCreateSheetPage(req, res) { res.render("sheet/create"); }

export function newSheet(req, res) { createSheet(req, res); }

export function showSheet(req, res) { renderSheet(req,res); }

export function editSheet(req, res) { editData(req, res); }

export function editSheetUsers(req, res) { editUsers(req, res); }

export function editSheetName(req, res) { renameSheet(req, res); }

export function subscribeSheet(req, res, next) { subscribe(req, res, next); }

export function updateSheet(req, res) { update(req, res); }

export function usersOnPage(req, res) { getListUsersOnPage(req, res); }

export function unSubscribeSheet(req, res, next) { unSubscribe(req, res, next); }

export function removeSheet(req, res) { remove(req, res); }

