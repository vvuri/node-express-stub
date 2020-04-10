import 'babel-polyfill';
import express from 'express';
import chalk from 'chalk';
import fs from 'fs';
import dotenv from 'dotenv';

import config from '../config.json';
import debug from './fs_logger';

export default class StaticServer {

    constructor (args) {
        const { hostname, port, dirname } = config;

        dotenv.config();
        this.host = args.host || process.env.HOST || hostname;
        this.port = args.port || process.env.PORT || port;
        this.rootDir = args.rootDir || process.env.ROOT_DIR || dirname;
        this.dirPath = args.dirPath || '/';

        debug(`ClassInit::     HOST: ${args.host}  PORT: ${args.port}  ROOT_DIR: ${args.rootDir}`);
        debug(`Environment::   HOST: ${process.env.HOST}  PORT: ${process.env.PORT}  ROOT_DIR: ${process.env.ROOT_DIR}`);
        debug(`Config.json::   HOST: ${hostname}  PORT: ${port}  ROOT_DIR: ${dirname}`);
        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`);

        this.app = express();
        this.server = null;

        for (const path of this.dirPath) {
            this.app.use(path, express.static(this.rootDir + path));
            this.app.get(path, this._resDirListFiles.bind(this) );
        }
    }

    _getDir ( folder, subdir, enconding ) {
        debug(`Folder: ${folder}, ${subdir}`);
        return new Promise((resolve, reject) => {
            fs.readdir(folder, enconding, (err, items) => {
                if (err)
                    reject(err);
                else {
                    let data = '';

                    for (const item of items)
                        data += `<li> ${item} (<A href="http://${this.host}:${this.port}${subdir}${item}">open</A>) </li>`;
                    resolve(data);
                }
            });
        });
    }

    _getHTMLDirList (subdir, listFiles) {
        let data = `<h2>List Files in <i>${this.rootDir}${subdir}</i>:</h2>`;

        data += `<ul> ${listFiles} </ul>`;

        // for (const item of items)
        //     data += `<li> ${item} (<A href="http://${this.host}:${this.port}${subdir}${item}">open</A>) </li>`;
        // resolve(data);

        return data;
    }

    _resDirListFiles (req, res, next, subdir = '') {
        let data;

        subdir = req.url;
        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`);
        debug(`Dir: ${subdir}  req url: ${req.url}`);
        debug(`#getDir( ${this.rootDir} + ${subdir} = ${this.rootDir.concat(subdir)} )`);
        this._getDir(this.rootDir.concat(subdir), subdir, 'utf-8')
            .then(files => {
                data = this._getHTMLDirList(subdir, files);
                //data = `<h2>List Files in <i>${this.rootDir}${subdir}</i>:</h2>`;
                //data += `<ul> ${files} </ul>`;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);
                debug('Return:' + data);
            })
            .catch(error => {
                debug(error);
                res.statusCode = 404;
                res.end('Dir Not Found');
            });
    }

    async start () {
        return new Promise( resolve => {
            try {
                this.server = this.app.listen(this.port, () => {
                    console.log(chalk.blue(`Server running at http://${this.host}:${this.port}/`));
                    resolve();
                });
            }
            catch (e) {
                resolve( new Error(e.message) );
            }
        });
    }

    async stop () {
        if (!this.server)
            return Promise.resolve( new Error(`Cannot read object 'server'`) );

        return new Promise( resolve => {
            try {
                this.server.close(err => {
                    if (err) {
                        debug(`Error server stopping: ${err.message}`);
                        resolve( new Error('Server is not running.') );
                    }
                    else {
                        debug(`Server stop!`);
                        console.log(`${chalk.blue('Server stop!')}`);
                        resolve();
                    }
                });
            }
            catch (e) {
                debug(`Error: Server NOT stopped!\n${e.message}`);
                resolve( new Error(`Error: Server NOT stopped!`) );
            }
        });
    }
}
