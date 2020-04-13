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
export async function startServer (...args) {
    let server;

    try {
        const NPORT = args[0] || PORT; // for testing

        server = await app.listen(NPORT, () => {
            console.log(chalk.blue(`Server running at http://${HOST}:${NPORT}/`));
        });
    }
    catch (e) {
        return [ e.message, null ];
    }
    return [ null, server ];
}

export async function stopServer (server) {
    let result;

    if (typeof server === 'undefined')
        return new Error(`Cannot read property 'server' of undefined `);

    try {
        result = await server.close( () => {
            console.log(`${chalk.blue('Server stop!')}`);
        });
    }
    catch (e) {
        console.log(`${chalk.red('Error:')} Server NOT stopped!`);
    }

    return result;
}
