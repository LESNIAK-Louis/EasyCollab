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
    if(req.params && req.params.sheetId && req.params.sheetId != "")
    {
        let sheet = easycollab.sheets[Number(req.params.sheetId)];
        if(sheet){
            if(res.locals.user && res.locals.user.username){
                sheet.usersOnPage.push(res.locals.user.username);
                next();
            } else{
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(400);
    }
}

export async function unSubscribe(req, res, next){
    console.log("triggered");
    if(req.params && req.params.sheetId && req.params.sheetId != "")
    {
        let sheet = easycollab.sheets[Number(req.params.sheetId)];
        if(sheet){
            if(res.locals.user && res.locals.user.username){
                let index = sheet.usersOnPage.indexOf(res.locals.user.username);
                if (index > -1) {
                    sheet.usersOnPage.splice(index, 1);
                    next();
                } else {
                    res.sendStatus(404);
                }     
            } else{
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(400);
    }
}

export async function update(req, res){
    if(req.params && req.params.sheetId && req.params.sheetId != "")
    {
        let sheet = easycollab.sheets[Number(req.params.sheetId)];
        if(sheet){
            let clientVersion = req.headers['if-none-match'];
            let prefer = req.headers.prefer;

            if(clientVersion && prefer){

                let waitTime = Number(prefer ? parseInt(prefer.split('=')[1]) : 0);

                if(Number(clientVersion) === sheet.version)
                {
                    if (waitTime > 0) {
                        await new Promise(resolve => setTimeout(resolve, waitTime));                 
                    }
                    
                    res.sendStatus(304);
                } else {
                    res.set('ETag', sheet.version).send(sheet.data);
                }

            } else {
                res.sendStatus(400);
            }

        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(400);
    }
    
}

export async function getListUsersOnPage(req, res){
    if(req.params && req.params.sheetId && req.params.sheetId != "")
    {
        let sheet = easycollab.sheets[Number(req.params.sheetId)];
        if(sheet){
                res.send(sheet.usersOnPage);

        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(400);
    }
    
}

export async function renderSheet(req, res){

    if(req.params && req.params.sheetId && req.params.sheetId != "")
    {
        let sheetId = Number(req.params.sheetId);
        let sheet = easycollab.sheets[sheetId];
        if(sheet){

            if(res.locals.user && res.locals.user.username){
                let user = easycollab.users[res.locals.user.username];
                if(user)
                {
                    if(user.ownedSheets.includes(sheetId) || user.sharedSheets.includes(sheetId)){
                        res.render("sheet/sheet", easycollab.sheets[sheetId]); 
                    } else{
                        res.sendStatus(403);
                    }
                } else{
                    res.sendStatus(404);
                }
            } else{
                res.sendStatus(403);
            }
        } else{
            res.sendStatus(404);
        }
    } else{
        res.sendStatus(400);
    }
}

export async function createSheet(req, res){

    if(req.body && req.body.sheetName){
        let sheetName = req.body.sheetName;
        if(sheetName != ""){
            if(res.locals.user && res.locals.user.username){
                let user = easycollab.users[res.locals.user.username];
                if(user)
                {
                    let sheet = new Sheet(easycollab.getNewId(), sheetName, res.locals.user.username);
                    if(sheet){
                        try {
                            easycollab.sheets[sheet.id] = sheet;
                            user.ownedSheets.push(sheet.id);
                            easycollab.save();
                            res.redirect("/sheet/" + sheet.id);
                        } catch(e){
                            console.log(e);
                            res.sendStatus(500);
                        }
                        
                    } else {
                        res.sendStatus(500);
                    }
                } else{
                    res.sendStatus(404);
                }
            } else{
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(406);
        }
    } else {
        res.sendStatus(400);
    }
}

export async function renameSheet(req, res){
    if(req.params && req.params.sheetId && req.params.sheetId != "" && req.body && req.body.name)
    {
        let name = req.body.name;
        if(name != "")
        {        
            if(res.locals.user && res.locals.user.username){
                let user = easycollab.users[res.locals.user.username];
                if(user){
                    let sheetId = Number(req.params.sheetId);

                    if(user.ownedSheets.includes(sheetId)){
                        try {
                            let sheet = easycollab.sheets[sheetId];
                            sheet.name = name;
                            easycollab.save();
                            res.redirect(200, "/");
                        } catch(e){
                            console.log(e);
                            res.sendStatus(500);
                        }
                    } else {
                        res.sendStatus(403);
                    }
                } else {
                    res.sendStatus(404)
                }
            } else {
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(406);
        }
    } else {
        res.sendStatus(400);
    }
}

export async function editData(req, res){

    if(!req.body || !req.body.si || !req.body.sj || !req.body.cellValue || !req.params || !req.params.sheetId || req.params.sheetId == ""){
        res.sendStatus(400); return;
    }
    
    let { si, sj, cellValue } = req.body;

    if(si == "" || sj == "" || cellValue == ""){
        res.sendStatus(400); return;
    }

    let sheetId = Number(req.params.sheetId);
    let i = Number(si);
    let j = Number(sj);

    if(!res.locals.user || !res.locals.user.username || res.locals.user.username == ""){
        res.sendStatus(403); return;
    }

    let user = easycollab.users[res.locals.user.username];

    if(!user){
        res.sendStatus(404); return;
    }

    if(!user.ownedSheets.includes(sheetId) && !user.sharedSheets.includes(sheetId)){
        res.sendStatus(403); return;
    } 

    let sheet = easycollab.sheets[sheetId];
    if(!sheet){
        res.sendStatus(404); return;
    }

    try{
        sheet.data[[i,j]] = cellValue;
        sheet.version += 1;
        easycollab.save();
        res.redirect(200, "/sheet/" + sheetId);
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
}

export async function editUsers(req, res){

    if(!req.body || !req.body.username || !("isAddition" in req.body) || !req.params || !req.params.sheetId || req.params.sheetId == ""){
        console.log(req.body.username);
        res.sendStatus(400); return;
    }

    if(!res.locals.user || !res.locals.user.username || res.locals.user.username == ""){
        res.sendStatus(403); return;
    }

    let { username, isAddition } = req.body;

    if(username == "" || (isAddition != true && isAddition != false)){
        res.sendStatus(400); return;
    }


    let sheetId = Number(req.params.sheetId);
    let currUser = easycollab.users[res.locals.user.username];

    if(!currUser){
        res.sendStatus(404); return;
    }

    if(username == res.locals.user.username){
        res.sendStatus(406); return;
    }

    let userModObj = easycollab.users[username];

    if(!userModObj){
        res.sendStatus(404); return;
    }

    if(!currUser.ownedSheets.includes(sheetId)){
        res.sendStatus(403); return;
    }
        
    let sheet = easycollab.sheets[sheetId];

    if(!sheet){
        res.sendStatus(404); return;
    }
    if(isAddition){

        if(sheet.users.includes(username) || userModObj.sharedSheets.includes(sheetId)){
            res.sendStatus(409); return;
        }

        try{
            sheet.users.push(username);
            userModObj.sharedSheets.push(sheetId);
            easycollab.save();
            res.sendStatus(200); return;
        } catch(e){
            console.log(e);
            res.sendStatus(500); return;
        }
    } 
    else {
        if(!sheet.users.includes(username)){
            res.sendStatus(409); return;
        }

        let index =  sheet.users.indexOf(username);
        let index2 =  userModObj.sharedSheets.indexOf(sheetId);

        if (index > -1 && index2 > -1) {

            try{
                sheet.users.splice(index, 1);
                userModObj.sharedSheets.splice(index2, 1);
                easycollab.save();
                res.sendStatus(200); return;
            } catch(e){
                console.log(e);
                res.sendStatus(500);  return;
            }

        } else{
            res.sendStatus(409); return;
        }  
    }
}

export async function remove(req, res){

    if(!req.params || !req.params.sheetId  || req.params.sheetId == ""){
        res.sendStatus(400); return;
    }

    let sheetId = Number(req.params.sheetId);

    if(!res.locals.user || !res.locals.user.username || res.locals.user.username == ""){
        res.sendStatus(403); return;
    }

    let user = easycollab.users[res.locals.user.username];

    if(!user){
        res.sendStatus(404); return;
    }

    let index = user.ownedSheets.indexOf(sheetId);
    if (index > -1) {
        user.ownedSheets.splice(index, 1);
    } else {
        res.sendStatus(404); return;
    }

    let sheet = easycollab.sheets[sheetId];

    if(!sheet){
        res.sendStatus(404); return;
    }
    

    for(let username of sheet.users){
        let userObj = easycollab.users[username];

        if(!userObj)
        {
            res.sendStatus(404); return;
        }

        if(userObj.sharedSheets.indexOf(sheetId) > -1){
            userObj.sharedSheets.splice(index, 1);
        }
    }

    try{
        delete easycollab.sheets[sheetId];
        easycollab.save();
        res.sendStatus(200); return;
    } catch(e){
        console.log(e);
        res.sendStatus(500); return;
    }
}
