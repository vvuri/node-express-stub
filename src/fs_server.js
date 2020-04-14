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

// return [ error, server ]
export async function startServer (port = PORT) {
    let server;

    try {
        server = await app.listen(port, () => {
            console.log(chalk.blue(`Server running at http://${HOST}:${port}/`));
        });
    }
    catch (e) {
        return [ e.message, null ];
    }
    return [ null, server ];
}

export async function stopServer (server) {
    let result;

    if (!server)
        return new Error(`Cannot read object 'server'`);

    try {
        result = await server.close( err => {
            if (err)
                console.log(`${chalk.red('Error')} server stopping: ${err.message}`);
            else
                console.log(`${chalk.blue('Server stop!')}`);
        });
    }
    catch (e) {
        console.log(`${chalk.red('Error:')} Server NOT stopped!`);
    }

    return result;
}
