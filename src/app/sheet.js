import { spreadsheet } from "../routes.js"
import User from "./user.js"

export default class Sheet{

    constructor(id, name){

        this.id = id;
        this.name = name;
        this.data = new Array();
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
