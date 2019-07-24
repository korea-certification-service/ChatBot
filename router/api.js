module.exports = (app) => {

    app.get('/', (req, res) => {
        res.render("index.html");
    });

    //단순한 echo API
    app.post('/sentence', (req, res) => {
        console.log(req.body)
        let data = req.body.text;
        res.status(200).send(data);
    });

}