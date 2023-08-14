import express from 'express';

const app = express();

app.use(express.static('public'));
// app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.listen(3000, () => {
    console.log("Server started on port 3000");
})