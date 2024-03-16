import express from 'express';
import path from 'path';
const __dirname = path.resolve();

const app = express();

app.use(express.static('public'));
// app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get("/model/:modelName", (req, res) => {
    const modelName = req.params.modelName;
    res.render(__dirname + "/pages/index.ejs", {
        modelName: modelName
    });
});

app.get("/display", (req, res) => {
    res.render(__dirname + "/pages/index.ejs", {
        modelName: "model_1"
    });
})

app.get("/gallery", (req, res) => {
    res.render(__dirname + "/pages/gallery.ejs", {
        modelNames: ["PURPLEBRASS", "WOODY", "FROGGY", 
                     "EGGSHELL", "BRONZEMON", "GOLD", 
                     "X", "Y", "Z",
                     "U", "V", "W", 
                     "Q"]
    })
})

app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/pages/about.html");
})

app.get("*", (req, res) => {
    res.render(__dirname + "/pages/gallery.ejs", {
        modelNames: ["PURPLEBRASS", "WOODY", "FROGGY", 
                     "EGGSHELL", "BRONZEMON", "GOLD",
                     "X", "Y", "Z",
                     "U", "V", "W", 
                     "Q"]
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server started on port 3000");
})