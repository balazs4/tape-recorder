const {exec, execSync} = require('child_process');
const {join} = require('path');
const app = require('express')();

app.use(require('body-parser').urlencoded({ extended: true, limit: '1mb' }));
app.use(require('body-parser').json({ extended: true, limit: '1mb' }));

app.post('/deezer',
    (req, res, next) => {
        execSync('killall -9 parec; true');
        next();
    },
    (req, res) => {
        const {artist, title, album} = req.body;
        const name = `${artist}.${album}.${title}`
            .replace(/\s/g, '')
            .replace(/!/g,'')
            .replace(/&/g,'')
            .replace(/\//g, '');
        console.log(name);
        exec(`./bin/record2mp3 ${name}`)
        res.sendStatus(202);
    })

app.listen(process.env.PORT || 4555);