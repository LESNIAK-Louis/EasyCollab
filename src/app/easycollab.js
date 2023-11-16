import { writeFile, readFile } from "fs/promises"
import User from "./user.js"
import Sheet from "./sheet.js"

export default class EasyCollab{

    constructor(){
        this.currentId = 0;
        this.users = {};
    }

    getNewId(){
        return ++this.currentId;
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
                this.users = spreadsheet.users;
            })
            .catch((error) => console.log(`Erreur en lecture : ${error.message}.`)
        );
    }
}