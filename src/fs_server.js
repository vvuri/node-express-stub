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

export function startServer () {
    let server;

    try {
        server = app.listen(PORT, () => {
            console.log(chalk.blue(`Server running at http://${HOST}:${PORT}/`));
        });
    }
    catch (e) {
        console.log(`${chalk.red('Error run server:')} ${e.message}`);
    }
    return server;
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
        console.log(`${chalk.red('Error:')} Server NOT stoped!`);
    }

    return result;
}
