const express = require("express");
const app = express();
var gca = require('gca-js');
const PORT = 8080;

class Controller {

    constructor(adapter, port) {
        this.port = port;
        this.adapter = (gca.getAdaptersList())[adapter];
        gca.startAdapter(this.adapter);
    }

    async pollData(res) {
        gca.readData(this.adapter, async (data) => {
            let input = await gca.objectData(data);
            res.set("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify(input));            
        });
    };

}

let control = new Controller(0, 1);


app.get("/", async (req, res) => {
    let dpad = await control.pollData(res);
})

app.listen(PORT, () => console.log("Server started on " + PORT));
