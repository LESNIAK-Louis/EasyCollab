import { spreadsheet } from "../routes.js"
import User from "./user.js"

export default class Sheet{

    constructor(id, name){

        this.id = id;
        this.name = name;
        this.data = {};
    }
}

export async function createSheet(req, res){

    let { sheetName } = req.body;
    let user = spreadsheet.users[res.locals.user.username];
    
    if(user){
        let sheet = new Sheet(spreadsheet.getNewId(), sheetName);
        user.ownedSheets[sheet.id] = sheet;
        spreadsheet.save();
        res.redirect("/sheet/" + sheet.id);
    }
}

export async function editData(req, res){
    
    let { id, sheetName, data } = req.body;
    let sheet = spreadsheet.users[res.locals.user.username].ownedSheets[id];
    sheet.name = sheetName;
    sheet.data = data;
    spreadsheet.save();
    res.redirect("/sheet/" + id);
}
