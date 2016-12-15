const {exec, execSync} = require('child_process');
const {join} = require('path');
const {writeFileSync, existsSync} = require('fs');
const app = require('express')();

app.use(require('body-parser').urlencoded({ extended: true, limit: '1mb' }));
app.use(require('body-parser').json({ extended: true, limit: '1mb' }));

const blacklist = { á: 'a', é: 'e', ú: 'u', ő: 'o', ű: 'u', ü: 'u', ö: 'o', ó: 'o', í: 'i', Á: 'A', É: 'E', Ú: 'U', Ő: 'O', Ó: 'O', Ü: 'U', Ö: 'O', Í: 'I', Ű: 'U' }

app.post('/deezer',
    (req, res, next) => {
        execSync('killall -9 parec; true');
        next();
    },
    (req, res) => {
        const {artist, title, album, cover} = req.body;
        const name = Object
            .keys(blacklist)
            .reduce((acc, ch) => acc.replace(new RegExp(ch, 'g'), blacklist[ch]),
            `${artist}.${album}.${title}`.replace(/\s|!|&|\/|'|"|(|)/g, '')
            );
        const [audio, picture, metadata] = ['mp3', 'png', 'json'].map(ext => join(__dirname, 'content', `${name}.${ext}`));

        if (existsSync(audio) === false) {
            exec(`./bin/record2mp3 ${audio}`);
            writeFileSync(`${picture}`, cover.replace(/^data:image\/png;base64,/, ''), 'base64');
            writeFileSync(`${metadata}`, JSON.stringify({ artist, title, album }));
        }

        res.sendStatus(202);
    })

app.listen(process.env.PORT || 4555);