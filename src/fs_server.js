import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import path from 'path';

import { getDir, getListSubDirectories, getNewFileName } from './fs_helper';
import config from '../config.json';
import debug from './fs_logger';

export default class StaticServer {

    constructor (args) {
        this.isRunning = false;

        const { hostname, port, dirname, maxUploadFileSize } = config;

        dotenv.config();

        this.host = args.host || process.env.HOST || hostname;
        this.port = args.port || process.env.PORT || port;
        this.rootDir = args.rootDir || process.env.ROOT_DIR || dirname;
        this.maxUploadSize = ( args.maxUploadFileSize || maxUploadFileSize ) * 1024 * 1024;
        this.app = null;
        this.server = null;

        debug(`ClassInit::     HOST: ${args.host}  PORT: ${args.port}  ROOT_DIR: ${args.rootDir}`, 'constructor');
        debug(`Environment::   HOST: ${process.env.HOST}  PORT: ${process.env.PORT}  ROOT_DIR: ${process.env.ROOT_DIR}`, 'constructor');
        debug(`Config.json::   HOST: ${hostname}  PORT: ${port}  ROOT_DIR: ${dirname}`, 'constructor');
        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`, 'constructor');
    }

    _upload (req, res) {
        debug(req.file.destination, 'POST.file.destination');
        res.redirect(req.get('Referer') || '/');
    }

    _getHTMLDirList (subdir, listFiles) {
        debug(listFiles, '_getHTMLDirList');
        let data = `<h2>List Files in <i>${this.rootDir}${subdir}</i>:</h2>`;

        debug(listFiles.dirs, '_getHTMLDirList.dir');
        data += `<ul>`;
        for (const item of listFiles.dirs)
            data += `<li><A href="http://${this.host}:${this.port}${subdir}${item}"><b>${item}</b></A></li>`;

        debug(listFiles.files, '_getHTMLDirList.files');
        for (const item of listFiles.files) {
            const substr = `<A href="http://${this.host}:${this.port}${subdir}${item}"`;

            data += `<li>${substr}>${item}</A>` +
                    ` (${substr} download>download</A>)</li>`;
        }
        data += `</ul>`;

        data += '<br>';
        data += `
        <form action="/" enctype="multipart/form-data" method="post">
          <input type="hidden" id="savePath" name="savePath" value="${subdir}"">
          <input type="file" name="fileToUpload" value="Select file">
          <input type="submit" value="Upload to server">
        </form>`;

        return data;
    }

    _resDirListFiles (req, res, next, subdir = '') {
        let data;

        subdir = req.url;
        const currentPath = path.join(this.rootDir, subdir);

        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`, '_resDirListFiles');
        debug(`Dir: ${subdir}  req url: ${req.url}`, '_resDirListFiles');
        debug(`#getDir( ${this.rootDir} + ${subdir} = ${currentPath}),  currentDir:${this.currentDir}`, '_resDirListFiles');

        getDir(currentPath)
            .then(files => {
                debug(files, '1');
                data = this._getHTMLDirList(subdir, files);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);

                debug('Return:' + data, '_resDirListFiles.then');
            })
            .catch(error => {
                res.statusCode = 404;
                res.end('Dir Not Found');

                debug(error, '_resDirListFiles.catch');
            });
    }

    async _initApp () {
        this.app = express();
        const dirPaths = await getListSubDirectories(this.rootDir);

        debug(dirPaths, '_initApp');
        for (const dirPath of dirPaths) {
            this.app.use(dirPath, express.static(path.join(this.rootDir, dirPath)));
            this.app.get(dirPath, this._resDirListFiles.bind(this) );
        }

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const localPath = path.join('./', this.rootDir, req.body.savePath);

                debug(localPath, '_configureUpload.destination');
                cb(null, localPath);
            },
            filename: async (req, file, cb) => {
                debug(file.originalname, '_configureUpload.filename');
                const newName = await getNewFileName(file.originalname, this.rootDir + req.body.savePath);

                debug(newName, '_configureUpload.getNewName');
                cb(null, newName);
            }
        });

        const upload = multer({
            storage: storage,
            limits:  { fileSize: this.maxUploadSize }
        }).single('fileToUpload');

        this.app.post('/', (req, res) => {
            upload( req, res, err => {
                if (err) {
                    debug(`${req.file} ${err.code}`, '_updateError');
                    switch (err.code) {
                        case 'LIMIT_FILE_SIZE':
                            res.end('Chosen file size is greater than ' + this.maxUploadSize);
                            break;
                        case 'INVALID_FILE_TYPE':
                            res.end('Chosen file is of invalid type');
                            break;
                        case 'ENOENT':
                            res.end('Unable to store the file');
                            break;
                    }
                }
                else
                    res.redirect(req.get('Referer') || '/');
            });
        }, this._upload);
    }

    async start () {
        if (this.isRunning)
            return Promise.reject( new Error(`Server is already running.`) );

        await this._initApp();

        return new Promise( (resolve, reject) => {
            debug(`Server running at http://${this.host}:${this.port}/`, 'start');
            try {
                this.server = this.app.listen(this.port, () => {
                    console.log(chalk.blue(`Server running at http://${this.host}:${this.port}/`));
                    this.isRunning = true;
                    resolve();
                })
                    .on('error', err => {
                        debug(err.message, 'start.listen.error');
                        reject( new Error(err.message) );
                    });
            }
            catch (err) {
                debug(err.message, 'start.reject');
                reject( new Error(err.message) );
            }
        });
    }

    async stop () {
        if (!this.server)
            return Promise.reject( new Error(`Cannot read object 'server'`) );

        if (!this.isRunning)
            return Promise.reject( new Error(`Server is not running.`) );

        return new Promise( (resolve, reject) => {
            try {
                this.server.close(err => {
                    if (err) {
                        debug(`Error server stopping: ${err.message}`, 'stop');
                        reject( new Error('Server is not running.') );
                    }
                    else {
                        debug(`Server stop!`, 'stop');
                        console.log(`${chalk.blue('Server stop!')}`);
                        this.isRunning = false;
                        resolve();
                    }
                });
            }
            catch (e) {
                debug(`Error: Server NOT stopped!\n${e.message}`, 'stop');
                reject( new Error(`Error: Server NOT stopped!`) );
            }
        });
    }
}
