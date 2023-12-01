import { easycollab } from "../routes.js"

export default class Sheet{

    constructor(id, name, owner){

        this.id = id;
        this.name = name;

        this.owner = owner;
        this.users = [];
        this.data = {};
    }
}

export async function renderSheet(req, res){

    let user = easycollab.users[res.locals.user.username];
    let sheetId = Number(req.params.sheetId);

    if(user.ownedSheets.includes(sheetId) || user.sharedSheets.includes(sheetId)){
        res.render("sheet/sheet", easycollab.sheets[sheetId]); 
    }
}

export async function createSheet(req, res){

    let { sheetName } = req.body;
    let user = easycollab.users[res.locals.user.username];
    
    if(user){
        let sheet = new Sheet(easycollab.getNewId(), sheetName, res.locals.user.username);
        easycollab.sheets[sheet.id] = sheet;
        user.ownedSheets.push(sheet.id);
        easycollab.save();
        res.redirect("/sheet/" + sheet.id);
    }
}

export async function renameSheet(req, res){
    
    let { id, name } = req.body;

    let user = easycollab.users[res.locals.user.username];
    let sheetId = Number(req.params.sheetId);

    if(name != "" && user.ownedSheets.includes(sheetId)){
        let sheet = easycollab.sheets[id];
        sheet.name = name;
        easycollab.save();
        res.redirect(200, "/");
        return;
    } else{
        res.redirect(403, "/");
    }
}

export async function editData(req, res){
    
    let { id, si, sj, cellValue } = req.body;

    let idSheet = Number(id);
    let i = Number(si);
    let j = Number(sj);

    let user = easycollab.users[res.locals.user.username];

    if(user.ownedSheets.includes(idSheet) || user.sharedSheets.includes(idSheet)){
        let sheet = easycollab.sheets[idSheet];
        sheet.data[[i,j]] = cellValue;
        easycollab.save();
        res.redirect(200, "/sheet/" + id);
    } else{
        res.redirect(403, "/sheet/" + id);
    }
}

export async function editUsers(req, res){

    let { id, username, isAddition } = req.body;

    let sheetId = Number(id);
    let currUser = easycollab.users[res.locals.user.username];

    if(username == res.locals.user.username){
        res.redirect(406, "/");
        return;
    }


    if(username in easycollab.users){

        let userModObj = easycollab.users[username];

        if(currUser.ownedSheets.includes(sheetId)){
            
            let sheet = easycollab.sheets[sheetId];
            if(isAddition){

                if(!sheet.users.includes(username) && !userModObj.sharedSheets.includes(sheetId)){
                    sheet.users.push(username);
                    userModObj.sharedSheets.push(sheetId);
                    easycollab.save();
                }
                else{
                    res.redirect(409, "/");
                    return;
                }
            } 
            else {
                if(sheet.users.includes(username)){
                    let index =  sheet.users.indexOf(username);
                    let index2 =  userModObj.sharedSheets.indexOf(sheetId);
                    if (index > -1 && index2 > -1) {
                        sheet.users.splice(index, 1);
                        userModObj.sharedSheets.splice(index2, 1);
                        easycollab.save();
                    }  else{
                        res.redirect(409, "/");
                        return;
                    }  
                }
                else{
                    res.redirect(409, "/");
                    return;
                }
            }
        } else{
            res.redirect(403, "/");
            return;
        }

        res.redirect(200, "/");  
        return;   
    } else{
        res.redirect(400, "/");
        return;
    }
}

export async function remove(req, res){

    let sheetId = Number(req.params.sheetId);

    let index = easycollab.users[res.locals.user.username].ownedSheets.indexOf(sheetId);
    if (index > -1) {
        easycollab.users[res.locals.user.username].ownedSheets.splice(index, 1);
    }

    

    for(let username of easycollab.sheets[sheetId].users){
        userObj = easycollab.users[username]
        if(userObj != null && userObj.sharedSheets.indexOf(sheetId) > -1){
            userObj.sharedSheets.splice(index, 1);
        }
    }

    delete easycollab.sheets[sheetId];
    easycollab.save();
    res.redirect("/");
}
