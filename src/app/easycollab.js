import { writeFile, readFile } from "fs/promises"
import User from "./user.js"
import Sheet from "./sheet.js"

export default class EasyCollab{

    constructor(){
        this.currentId = 0;
        this.users = {};
        this.sheets = {};
    }

    getNewId(){
        return ++this.currentId;
    }

    async save(){

        let sheetsSave = {};
        console.log(this.sheets);
        for (let key in this.sheets) {
            const { usersOnPage, ...sheetSave } = this.sheets[key];
            sheetsSave[key] = sheetSave;
        };

        let save = {
            currentId: this.currentId,
            users: this.users,
            sheets : sheetsSave
        }


        let json = JSON.stringify(save);
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
                this.users = spreadsheet.users

                for (let key in spreadsheet.sheets) {
                    let usersOnPage = [];
                    spreadsheet.sheets[key]['usersOnPage'] = usersOnPage;
                };

                this.sheets = spreadsheet.sheets;

                

              
            })
            .catch((error) => console.log(`Erreur en lecture : ${error.message}.`)
        );
    }

      
}