import { writeFile, readFile } from "fs/promises"
import User from "./user.js"
import Sheet from "./sheet.js"

export default class SpreadSheet{

    constructor(){
        this.currentId = 0;
        this.users = {};
    }

    getNewId(){
        return ++this.currentId;
    }

    getUser(username){
        return this.users[username];
    }

    addUser(user){
        this.users[user.username] = user;
    }

    async save(){
        let json = JSON.stringify(this);
        await writeFile("./data/spreadsheet.json", json).then(
            () => "ok",
            (error) => console.log(`Erreur lors de la sauvegarde : ${error.message}.`)
        );
    }

    async load(){

        await readFile("./data/spreadsheet.json", "utf8")
            .then((text) => {
                let spreadsheet = JSON.parse(text);
                this.currentId = spreadsheet.currentId;
                
                for(var [name, user] of Object.entries(spreadsheet.users)){
                    
                    let userObj = new User(user.username, user.password);
                    for(var [id,sheet] of Object.entries(user.ownedSheets)){

                        let sheetObj = new Sheet(id, sheet.name);
                        sheetObj.setData(sheet.data);
                        userObj.addSheet(sheetObj);
                    }
                    this.addUser(userObj);
                }
                this.users = spreadsheet.users;
            })
            .catch((error) => console.log(`Erreur en lecture : ${error.message}.`)
        );
    }
}