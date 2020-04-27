import 'babel-polyfill';
import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import multer from 'multer';

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

        debug(`ClassInit::     HOST: ${args.host}  PORT: ${args.port}  ROOT_DIR: ${args.rootDir}`, 'constructor');
        debug(`Environment::   HOST: ${process.env.HOST}  PORT: ${process.env.PORT}  ROOT_DIR: ${process.env.ROOT_DIR}`, 'constructor');
        debug(`Config.json::   HOST: ${hostname}  PORT: ${port}  ROOT_DIR: ${dirname}`, 'constructor');
        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`, 'constructor');

        this.upload = multer({ dest: 'uploads/' });

        this.app = express();
        this.server = null;

        this.app.post('/upload', this.upload.none(), this._upload);

        for (const path of this.dirPath) {
            this.app.use(path, express.static(this.rootDir + path));
            this.app.get(path, this._resDirListFiles.bind(this) );
        }
    }

    _upload (req, res, next) {
        // req.file is the `avatar` file
        // req.body will hold the text fields, if there were any
        debug('Uploadfile', res.status, req.status, next.status);
        debug(req.file, 'req.file');
        debug(req.body, 'req.body');
    }

    _getDir ( folder, subdir, enconding ) {
        debug(`Folder: ${folder}, ${subdir}`, '_getDir');

        return new Promise((resolve, reject) => {
            fs.readdir(folder, [enconding, true], (err, items) => {
                if (err)
                    reject(err);
                else {
                    debug(items, '_getDir');
                    resolve(items);
                }
            });
        });
    }

    _getListDirAndFiles (subdir, listFiles) {
        const result = { dirs: [], files: [] };

        listFiles.forEach( fileName => {
            try {
                const stats = fs.lstatSync(subdir + fileName);

                if (stats.isDirectory())
                    result.dirs.push(fileName);
                if (stats.isFile())
                    result.files.push(fileName);
            }
            catch (e) {
                debug(`Error in fs.lstatSync: ${e.message}`, '_getListDirAndFiles');
            }
        });

        debug(JSON.stringify(result), '_getListDirAndFiles');
        return result;
    }

    _getHTMLDirList (subdir, listFiles) {
        let data = `<h2>List Files in <i>${this.rootDir}${subdir}</i>:</h2>`;

        data += `<ul>`;
        for (const item of listFiles.dirs)
            data += `<li> <b>${item}</b>> (<A href="http://${this.host}:${this.port}${subdir}${item}">open</A>)</li>`;

        for (const item of listFiles.files) {
            data += `<li> ${item} (<A href="http://${this.host}:${this.port}${subdir}${item}">open</A>)` +
                    `(<A href="http://${this.host}:${this.port}${subdir}${item}" download>download</A>)</li>`;
        }
        data += `</ul>`;

        // Add Upload form
        data += '<br>';
        data += `
        <form action="/upload" enctype="multipart/form-data" method="post">
          <div class="form-group">
            <input type="file" name="uploaded_file">
            <input type="submit" value="Upload">
          </div>
        </form>`;

        return data;
    }

    _resDirListFiles (req, res, next, subdir = '') {
        let data;

        subdir = req.url;

        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`, '_resDirListFiles');
        debug(`Dir: ${subdir}  req url: ${req.url}`, '_resDirListFiles');
        debug(`#getDir( ${this.rootDir} + ${subdir} = ${this.rootDir.concat(subdir)} )`, '_resDirListFiles');

        this._getDir(this.rootDir.concat(subdir), subdir, 'utf-8')
            .then(files => {
                const listDirAndFiles = this._getListDirAndFiles(this.rootDir.concat(subdir), files);

                data = this._getHTMLDirList(subdir, listDirAndFiles);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);

                debug('Return:' + data, '_resDirListFiles');
            })
            .catch(error => {
                res.statusCode = 404;
                res.end('Dir Not Found');

                debug(error, '_resDirListFiles');
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
                        debug(`Error server stopping: ${err.message}`, 'stop');
                        resolve( new Error('Server is not running.') );
                    }
                    else {
                        debug(`Server stop!`, 'stop');
                        console.log(`${chalk.blue('Server stop!')}`);
                        resolve();
                    }
                });
            }
            catch (e) {
                debug(`Error: Server NOT stopped!\n${e.message}`, 'stop');
                resolve( new Error(`Error: Server NOT stopped!`) );
            }
        });
    }
}
