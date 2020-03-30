import * as fs from 'fs';
import * as mime from 'mime-types';

import config from '../config.json';
const hostname = config.hostname || '127.0.0.1';
const port = config.port || '8888';
const dirname = config.dirname || '';

// logging to file debug
import util from 'util';
const logFile = fs.createWriteStream('debug.log', { flags: 'w' });

console.log = function (d) {
    logFile.write(util.format(d) + '\n');
};

import express from 'express';
const app = express();

const rootDir = (req, res, next, subdir = '') => {
    let data;

    console.log(`Dir: ${subdir}`);
    getDir(dirname.concat(subdir), subdir, 'utf-8')
        .then(files => {
            data = `<h2>List Files in <i>${dirname}${subdir}</i>:</h2>`;
            data += `<ul> ${files} </ul>`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            console.log('Return:' + data);
            res.end(data);
        })
        .catch(error => {
            console.log(error);
            res.statusCode = 404;
            res.end('Dir Not Found');
        });
};

const filesDir = (req, res) => {
    console.log(`url file:  ${req.url},  ${req.method},  ${req.params.id},  ${req.originalUrl}`);
    fs.readFile(dirname + req.url, (err, data) => {
        if (err) {
            switch (err['code']) {
                case 'EPERM':
                    res.statusCode = 423;
                    res.end('Access Denied');
                    break;
                case 'EISDIR':
                    rootDir(req, res, null, req.url);
                    break;
                case 'ENOENT':
                    res.statusCode = 404;
                    res.end('File not Found');
                    break;
                default:
                    res.statusCode = 403;
                    res.end('Forbidden');
                    break;
            }
            console.log(JSON.stringify(err));
            return;
        }
        console.log(`ContentType: ${mime.lookup(req.url)}`);
        res.setHeader('Content-Type', mime.lookup(req.url));
        req.acceptsCharsets('utf-8');
        res.writeHead(200);
        res.end(data);
    });
};

function getDir (folder, subdir, enconding) {
    console.log(`Folder: ${folder}, ${subdir}`);
    return new Promise((resolve, reject) => {
        fs.readdir(folder, enconding, (err, items) => {
            if (err)
                reject(err);
            else {
                let data = '';

                for (const item of items)
                    data += `<li> ${item} (<A href="http://${hostname}:${port}${subdir}/${item}">open</A>) </li>`;
                resolve(data);
            }
        });
    });
}

app.get('/', rootDir);
app.get('/:id', filesDir);
app.get('/elements/:id', filesDir);
app.get('/elements/subelements/:id', filesDir);

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

export default app;
