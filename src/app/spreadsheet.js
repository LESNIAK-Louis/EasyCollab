import { writeFile, readFile } from "fs/promises"

export default class SpreadSheet{

    constructor(){
        this.users = new Array();
    }

    getUser(username){
        return this.users.find((user) => user.username == username);
    }

    addUser(user){
        this.users.push(user);
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
                this.users = spreadsheet.users;
            })
            .catch((error) => console.log(`Erreur en lecture : ${error.message}.`)
        );
    }
}