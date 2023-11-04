import express from 'express';
import path from 'path';
const __dirname = path.resolve();

const app = express();

app.use(express.static('public'));
// app.use('/node_modules', express.static(__dirname + '/node_modules'));


app.get("/gallery", (req, res) => {
    res.sendFile(__dirname + "/pages/gallery.html");
})

app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/pages/about.html");
})

app.get("*", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html");
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server started on port 3000");
})