import fs from 'fs';
import mime from 'mime-types';

import debug from './fs_logger';
import { HOST, PORT, ROOT_DIR } from './fs_config';

const EISDIR = 'EISDIR';
const EPERM = 'EPERM';
const ENOENT = 'ENOENT';

export const rootDir = (req, res, next, subdir = '') => {
    let data;

    debug(`Dir: ${subdir}`);
    _getDir(ROOT_DIR.concat(subdir), subdir, 'utf-8')
        .then(files => {
            data = `<h2>List Files in <i>${ROOT_DIR}${subdir}</i>:</h2>`;
            data += `<ul> ${files} </ul>`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            debug('Return:' + data);
            res.end(data);
        })
        .catch(error => {
            debug(error);
            res.statusCode = 404;
            res.end('Dir Not Found');
        });
};

export const filesDir = (req, res) => {
    debug(`url file:  ${req.url},  ${req.method},  ${req.params.id},  ${req.originalUrl}`);
    fs.readFile(ROOT_DIR + req.url, (err, data) => {
        if (err) {
            if (err.code === EISDIR)
                rootDir(req, res, null, req.url);
            else {
                const { statusCode, codeText } = _getErrorStatusCode(err);

                res.statusCode = statusCode;
                res.end(codeText);
                debug(JSON.stringify(err));
            }
            return;
        }
        debug(`ContentType: ${mime.lookup(req.url)}`);
        res.setHeader('Content-Type', mime.lookup(req.url));
        req.acceptsCharsets('utf-8');
        res.writeHead(200);
        res.end(data);
    });
};

function _getErrorStatusCode (err) {
    const res = {};

    switch (err.code) {
        case EPERM:
            res.statusCode = 423;
            res.codeText = 'Access Denied';
            break;
        case ENOENT:
            res.statusCode = 404;
            res.codeText = 'File not Found';
            break;
        default:
            res.statusCode = 403;
            res.codeText = 'Forbidden';
            break;
    }
    return res;
}

function _getDir (folder, subdir, enconding) {
    debug(`Folder: ${folder}, ${subdir}`);
    return new Promise((resolve, reject) => {
        fs.readdir(folder, enconding, (err, items) => {
            if (err)
                reject(err);
            else {
                let data = '';

                for (const item of items)
                    data += `<li> ${item} (<A href="http://${HOST}:${PORT}${subdir}/${item}">open</A>) </li>`;
                resolve(data);
            }
        });
    });
}
