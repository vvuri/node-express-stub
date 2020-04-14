import chalk from 'chalk';
import express from 'express';
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
    const result = { error: null, server: null };

    if (!server)
        result.error = new Error(`Cannot read object 'server'`);

    try {
        result.server = await server.close( err => {
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
