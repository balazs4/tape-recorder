const {exec, execSync} = require('child_process');
const {join, resolve} = require('path');
const {writeFileSync, existsSync, unlinkSync} = require('fs');
const id3 = require('node-id3');

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
            `${artist}.${album}.${title}`.replace(/\s|!|&|\/|'|"|\(|\)/g, '')
            );
        const [audio, image, metadata] = ['mp3', 'jpg', 'json'].map(ext => join(__dirname, 'content', `${name}.${ext}`));

        if (existsSync(audio) === false) {
            const record = exec(`./bin/record2mp3 ${audio}`);

            record.on('close', (code) => {
                writeFileSync(image, cover.replace(/^data:image\/png;base64,/, ''), 'base64');
                console.log('Recording stoped...');
                console.log(id3.write({ artist, title, album, image }, audio) ? "DONE" : "ERROR");
                unlinkSync(image);
            })

            //writeFileSync(`${metadata}`, JSON.stringify({ artist, title, album }));
        }

        res.sendStatus(202);
    })

app.listen(process.env.PORT || 4555);
