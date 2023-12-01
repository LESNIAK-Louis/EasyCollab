import { easycollab } from "../routes.js"

export default class Sheet{

    constructor(id, name, owner){

        this.id = id;
        this.name = name;

        this.owner = owner;
        this.users = [];
        this.data = {};
        this.version = 0;
        this.usersOnPage = [];
    }
}

export async function subscribe(req, res, next){
    let sheet = easycollab.sheets[Number(req.params.sheetId)];
    sheet.usersOnPage.push(res.locals.user.username);
    next();
}

export async function unSubscribe(req, res, next){
    let sheet = easycollab.sheets[Number(req.params.sheetId)];
    let index = sheet.usersOnPage.indexOf(res.locals.user.username);
    if (index > -1) {
        sheet.usersOnPage.splice(index, 1);
    }
    next();
}

export async function update(req, res, next){
    let sheet = easycollab.sheets[Number(req.params.sheetId)];

    let clientVersion = req.headers['if-none-match'];
    let waitTime = req.headers.prefer ? parseInt(req.headers.prefer.split('=')[1]) : 0;

    if(Number(clientVersion) === sheet.version)
    {
        if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        res.sendStatus(304);
    } else {
        res.set('ETag', sheet.version).send(sheet.data);
    }
    
}

export async function renderSheet(req, res){

    let user = easycollab.users[res.locals.user.username];
    let sheetId = Number(req.params.sheetId);

    if(user.ownedSheets.includes(sheetId) || user.sharedSheets.includes(sheetId)){
        res.render("sheet/sheet", easycollab.sheets[sheetId]); 
        return;
    }
    res.render(403, "/"); 
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
        return;
    }
    res.render(403, "/"); 
}

export async function renameSheet(req, res){
    
    let { name } = req.body;

    let user = easycollab.users[res.locals.user.username];
    let sheetId = Number(req.params.sheetId);

    if(name != "" && user.ownedSheets.includes(sheetId)){
        let sheet = easycollab.sheets[sheetId];
        sheet.name = name;
        easycollab.save();
        res.redirect(200, "/");
        return;
    } 

    res.redirect(403, "/");
}

export async function editData(req, res){
    
    let { si, sj, cellValue } = req.body;

    let sheetId = Number(req.params.sheetId);
    let i = Number(si);
    let j = Number(sj);

    let user = easycollab.users[res.locals.user.username];

    if(user.ownedSheets.includes(sheetId) || user.sharedSheets.includes(sheetId)){
        let sheet = easycollab.sheets[sheetId];
        sheet.data[[i,j]] = cellValue;
        sheet.version += 1;
        easycollab.save();
        res.redirect(200, "/sheet/" + sheetId);
        return;
    } 

    res.redirect(403, "/sheet/" + sheetId);
}

export async function editUsers(req, res){

    let { username, isAddition } = req.body;

    let sheetId = Number(req.params.sheetId);
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
    res.redirect(200, "/");
}
