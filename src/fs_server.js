const http = require('http');
const fs = require('fs');

const config = require('../config.json');
const hostname = config.hostname || '127.0.0.1';
const port = config.port || '8888';
const dirname = config.dirname || "";

const mime = require('mime-types')

const ContentType = {
    'mov': 'video/quicktime',
    'mp4': 'video/mp4',
    'flv': 'video/x-flv',
    '3gp': 'video/3gpp',
    'wmv': 'video/x-ms-wmv',
    'avi': 'video/x-msvideo',
    'mpeg': 'video/mpeg',
    'wav': 'audio/wav',
    'txt': 'text/plain; charset=utf-8',
    'ttf': 'font/ttf',
    'htm': 'text/html',
    'html': 'text/html',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'jpeg': 'image/jpeg',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'css': 'text/css'
}

// logging to file debug
let util = require('util');
let log_file = fs.createWriteStream('debug.log', {flags : 'w'});
let log_stdout = process.stdout;
console.log = function(d) {
    log_file.write(util.format(d) + '\n');
    //log_stdout.write(util.format(d) + '\n');
};


const server = http.createServer((req, res) => {
    if (req.url=='/') {
        let data;

        getDir(dirname, "utf-8")
            .then((files) => {
                data = `<h2>List Files in <i>${dirname}</i>:</h2>`;
                data += `<ul> ${files} </ul>`;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                console.log("Return:" + data);
                res.end(data);
            })
            .catch((error) => {
                console.log(error);
                res.statusCode = 404;
                res.end('Dir Not Found');
            })
    } else {
        console.log("url file:" + req.url);
        fs.readFile(dirname + req.url, function (err, data) {
            if (err) {
                switch(err['code']) {
                case 'EPERM':
                    res.statusCode = 423;
                    res.end("Access Denied");
                    break;
                case 'EISDIR':
                    res.statusCode = 406;
                    res.end("SubDirectory not allow");
                    break;
                case 'ENOENT':
                    res.statusCode = 404;
                    res.end("File not Found");
                    break;
                default:
                    res.statusCode = 403;
                    res.end("Forbidden");
                    break;
                }
                console.log(JSON.stringify(err));
                return;
            }
            const ext = (req.url.match(/\.([^.]*?)(?=\?|#|$)/) || [])[1]
            console.log(ext);
            if (ext in ContentType) {
                console.log(ContentType[ext]);
                res.setHeader('Content-Type', ContentType[ext]);
            } else {
                res.setHeader('Content-Type', 'text/plain');
            }

            res.writeHead(200);
            res.end(data);
        });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getDir (folder, enconding) {
    return new Promise(function(resolve, reject) {
        fs.readdir(folder,enconding, function(err, items) {
            if (err) {
                reject(err);
            } else {
                let data = '';
                for (var i = 0; i < items.length; i++) {
                    data += `<li> ${items[i]} (<A href="http://${hostname}:${port}/${items[i]}">open</A>) </li>`;
                }
                resolve(data);
            }
        });
    });
}
