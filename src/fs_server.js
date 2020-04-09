import express from 'express';
import chalk from 'chalk';

import { resDirListFiles } from './fs_tools';
import { HOST, PORT, ROOT_DIR } from './fs_config';

//const app = express();

// for (const path of dirPath) {
//     app.use(path, express.static(ROOT_DIR + path));
//     app.get(path, resDirListFiles);
// }

// app.listen(PORT, () => {
//     console.log(chalk.blue(`Server running at http://${HOST}:${PORT}/`));
// });

export default class StaticServer {
    // constructor (...args) {
    //     this.root_dir = args.root_dir || ROOT_DIR;
    //     this.host = args.host || HOST;
    //     this.port = args.port || PORT;
    //     this.dir_path= args.dir_path || '/';
    constructor (host, port, root_dir, dir_path) {
        this.root_dir = root_dir || ROOT_DIR;
        this.host = host || HOST;
        this.port = port || PORT;
        this.dir_path= dir_path || '/';

        console.log(`PORT: ${this.port}  HOST: ${this.host}  ROOT_DIR: ${this.root_dir}`);

        this._initApp();
    }

    _initApp () {
        this.app = express();

        for (const path of this.dir_path) {
            this.app.use(path, express.static(this.root_dir + path));
            this.app.get(path, resDirListFiles);
        }
    }

    start () {
        this.server = this.app.listen(this.port, () => {
            console.log(chalk.blue(`Server running at http://${this.host}:${this.port}/`));
        });
    }

    stop () {
        this.server.close(() => {
            console.log(chalk.blue('Server stop!'));
        });
    }
}

const dirPath = [
    '/',
    '/elements',
    '/elements/subelements'
];

const srv = new StaticServer(null,null,null, dirPath);

srv.start();
