import * as http from 'http';
import * as fs from 'fs';
import * as mime from 'mime-types';

const config = require('../config.json');
const hostname = config.hostname || '127.0.0.1';
const port = config.port || '8888';
const dirname = config.dirname || '';

// logging to file debug
const util = require('util');
const logFile = fs.createWriteStream('debug.log', { flags: 'w' });

console.log = function (d) {
    logFile.write(util.format(d) + '\n');
};


const server = http.createServer((req, res) => {
    if (req.url === '/') {
        let data;

        getDir(dirname, 'utf-8')
            .then(files => {
                data = `<h2>List Files in <i>${dirname}</i>:</h2>`;
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
    }
    else {
        console.log('url file:' + req.url);
        fs.readFile(dirname + req.url, (err, data) => {
            if (err) {
                switch (err['code']) {
                    case 'EPERM':
                        res.statusCode = 423;
                        res.end('Access Denied');
                        break;
                    case 'EISDIR':
                        res.statusCode = 406;
                        res.end('SubDirectory not allow');
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
            res.writeHead(200);
            res.end(data);
        });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getDir (folder, enconding) {
    return new Promise((resolve, reject) => {
        fs.readdir(folder, enconding, (err, items) => {
            if (err)
                reject(err);
            else {
                let data = '';

                for (const item of items)
                    data += `<li> ${item} (<A href="http://${hostname}:${port}/${item}">open</A>) </li>`;
                resolve(data);
            }
        });
    });
}
