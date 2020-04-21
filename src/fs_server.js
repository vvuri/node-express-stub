import chalk from 'chalk';
import express from 'express';
import { resDirListFiles } from './fs_tools';
import { HOST, PORT, ROOT_DIR } from './fs_config';
import debug from './fs_logger';

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

export async function startServer (port = PORT) {
    const result = { error: null, server: null };

    return new Promise( resolve => {
        try {
            result.server = app.listen(port, () => {
                console.log(chalk.blue(`Server running at http://${HOST}:${port}/`));
                resolve(result);
            });
        }
        catch (e) {
            result.error = e.message;
            resolve(result);
        }
    });
}

export async function stopServer (server) {
    const resultStop = { error: null, server: server };

    if (!server) {
        resultStop.error = new Error(`Cannot read object 'server'`);
        return Promise.resolve(resultStop);
    }

    return new Promise( resolve => {
        try {
            server.close(err => {
                if (err) {
                    debug(`Error server stopping: ${err.message}`);
                    resultStop.error = 'Server is not running.';
                }
                else {
                    debug(`Server stop!`);
                    console.log(`${chalk.blue('Server stop!')}`);
                    resultStop.server = null;
                }
                resolve(resultStop);
            });
        }
        catch (e) {
            debug(`Error: Server NOT stopped!\n${e.message}`);
            resultStop.error =  new Error(`Error: Server NOT stopped!`);
            resolve(resultStop);
        }
    });
}
