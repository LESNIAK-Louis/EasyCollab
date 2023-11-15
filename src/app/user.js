export default class User{

    constructor(username, password){

        this.username = username;
        this.password = password;

        this.ownedSheets = {};
    }

    addSheet(sheet){

        this.ownedSheets[sheet.id] = sheet;
    }

    getSheet(id){
        return this.ownedSheets[id];
    }
}