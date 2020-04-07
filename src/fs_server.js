import express from 'express';
import chalk from 'chalk';

import { resDirListFiles } from './fs_tools';
import { HOST, PORT, ROOT_DIR } from './fs_config';

const app = express();

const dirPath = [
    '/',
    '/elements',
    '/elements/subelements'
];

for (const path of dirPath) {
    app.use(path, express.static(ROOT_DIR + path));
    app.get(path, resDirListFiles);
}

export function start () {
    return new Promise((resolve, reject) => {
        app.listen(PORT, err => {
            if (err) reject(err);
            console.log(chalk.blue(`Server running at http://${HOST}:${PORT}/`));
            resolve();
        });
    });
}

export function stop (url) {
    return new Promise((resolve, reject) => {
        app.close( err => {
            if (err) reject(err);
            console.log(`Server closed on ${url}`);
            resolve();
        });
    });
}

start();

export default app;
