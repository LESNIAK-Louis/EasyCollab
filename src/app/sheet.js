import { easycollab } from "../routes.js"

export default class Sheet{

    constructor(id, name){

        this.id = id;
        this.name = name;
        this.data = {};
    }
}

export async function createSheet(req, res){

    let { sheetName } = req.body;
    let user = easycollab.users[res.locals.user.username];
    
    if(user){
        let sheet = new Sheet(easycollab.getNewId(), sheetName);
        user.ownedSheets[sheet.id] = sheet;
        easycollab.save();
        res.redirect("/sheet/" + sheet.id);
    }
}

export async function editData(req, res){
    
    let { id, sheetName, data } = req.body;
    let sheet = easycollab.users[res.locals.user.username].ownedSheets[id];
    sheet.name = sheetName;
    sheet.data = data;
    easycollab.save();
    res.redirect("/sheet/" + id);
}

export async function remove(req, res){

    delete easycollab.users[res.locals.user.username].ownedSheets[req.params.sheetId];
    easycollab.save();
    res.redirect("/");
}
