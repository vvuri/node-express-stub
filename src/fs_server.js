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

    try {
        result.server = await app.listen(port, () => {
            console.log(chalk.blue(`Server running at http://${HOST}:${port}/`));
        });
    }
    catch (e) {
        result.error = e.message;
    }
    return result;
}

export async function stopServer (server) {
    const resultStop = { error: null, server: null, message: null };

    if (!server)
        resultStop.error = new Error(`Cannot read object 'server'`);
    else {
        const promise = new Promise( (resolve, reject) => {
            try {
                server.close(err => {
                    if (!err) {
                        debug(`Server stop!`);
                        resultStop.message = `${chalk.blue('Server stop!')}`;
                        resolve(server);
                    }
                    else {
                        debug(`Error server stopping: ${err.message}`);
                        resultStop.message = `${chalk.red('Error')} server stopping: ${err.message}`;
                        reject(new Error(err.message));
                    }
                });
            }
            catch (e) {
                debug(`Error: Server NOT stopped!\n${e.message}`);
                resultStop.message = `${chalk.red('Error:')} Server NOT stopped!\n${e.message}`;
                reject( new Error(`Error: Server NOT stopped!`) );
            }
        });

        await promise
            .then( result => {
                resultStop.server = result;
            }, error => {
                resultStop.error = error;
            });
    }

    return resultStop;
}
