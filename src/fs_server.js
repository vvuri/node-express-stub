import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import path from 'path';

import { getDirectorySources, getNewFileName, getSubDirectoryUrlsRecursive } from './fs_helper';
import config from '../config.json';
import debug from './fs_logger';

const HTML_UPLOAD_NAME = 'fileToUpload';

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

    _getHTMLDirList (subdir = '', listFiles = { files: '', dirs: '' }) {
        debug(listFiles, '_getHTMLDirList');
        let data = `<h2>List Files in <i>${this.rootDir}${subdir}</i>:</h2>`;
        const getItemHref = item => `"http://${this.host}:${this.port}${subdir}${item}"`;

        data += `<ul>`;
        debug(listFiles.dirs, '_getHTMLDirList.dir');
        for (const item of listFiles.dirs)
            data += `<li><A href=${getItemHref(item)}><b>${item}</b></A></li>`;

        debug(listFiles.files, '_getHTMLDirList.files');
        for (const item of listFiles.files) {
            const substr = `<A href=${getItemHref(item)}`;

            data += `<li>${substr}>${item}</A>` +
                ` (${substr} download>download</A>)</li>`;
        }
        data += `</ul>`;

        data += '<br>';
        data += `
        <form action="/" enctype="multipart/form-data" method="post">
          <input type="hidden" id="savePath" name="savePath" value="${subdir}"">
          <input type="file" name="${HTML_UPLOAD_NAME}" value="Select file">
          <input type="submit" value="Upload to server">
        </form>`;

        return data;
    }

    _resDirListFiles (req, res) {
        let data;

        const subdir = req.url;
        const currentPath = path.join(this.rootDir, subdir);

        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`, '_resDirListFiles');
        debug(`Dir: ${subdir}  req url: ${req.url}`, '_resDirListFiles');
        debug(`getDirectorySources( ${this.rootDir} + ${subdir} = ${currentPath})`, '_resDirListFiles');

        getDirectorySources(currentPath)
            .then(souces => {
                data = this._getHTMLDirList(subdir, souces);
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

    _reloadPage (req, res) {
        res.redirect(req.get('Referer') || '/');
    }

    _configureUpload () {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const localPath = path.join('./', this.rootDir, req.body.savePath);

                debug(localPath, '_configureUpload.destination');
                cb(null, localPath);
            },
            filename: (req, file, cb) => {
                debug(file.originalname, '_configureUpload.filename');
                const newName = getNewFileName(file.originalname, this.rootDir + req.body.savePath);

                debug(newName, '_configureUpload.getNewName');
                cb(null, newName);
            }
        });

        const upload = multer({
            storage: storage,
            limits:  { fileSize: this.maxUploadSize }
        }).single(HTML_UPLOAD_NAME);

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
                        default:
                            res.end('Something went wrong. Please try again later.');
                            break;
                    }
                }
                else
                    this._reloadPage(req, res);
            });
        }, this._reloadPage);
    }

    async _initApp () {
        this.app = express();
        const dirPaths = await getSubDirectoryUrlsRecursive(this.rootDir);

        debug(dirPaths, '_initApp');
        for (const dirPath of dirPaths) {
            this.app.use(dirPath, express.static(path.join(this.rootDir, dirPath)));
            this.app.get(dirPath, this._resDirListFiles.bind(this));
        }

        this._configureUpload();
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
