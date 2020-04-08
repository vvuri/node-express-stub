import fs from 'fs';

import debug from './fs_logger';
import { HOST, PORT, ROOT_DIR } from './fs_config';

function _getDir (folder, subdir, enconding) {
    debug(`Folder: ${folder}, ${subdir}`);
    return new Promise((resolve, reject) => {
        fs.readdir(folder, enconding, (err, items) => {
            if (err)
                reject(err);
            else {
                let data = '';

                for (const item of items)
                    data += `<li> ${item} (<A href="http://${HOST}:${PORT}${subdir}${item}">open</A>) </li>`;
                resolve(data);
            }
        });
    });
}

export const resDirListFiles = (req, res, next, subdir = '') => {
    let data;

    debug(`Dir: ${subdir}  req url: ${req.url}`);
    subdir = req.url;
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
