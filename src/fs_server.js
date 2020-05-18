import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';

import { getDir, getListDirAndFiles, getListSubDirectories } from './fs_helper';
import config from '../config.json';
import debug from './fs_logger';

export default class StaticServer {

    constructor (args) {
        this.isRunning = false;

        const { hostname, port, dirname } = config;

        dotenv.config();

        this.host = args.host || process.env.HOST || hostname;
        this.port = args.port || process.env.PORT || port;
        this.rootDir = args.rootDir || process.env.ROOT_DIR || dirname;
        this.dirPath = [];
        this.currentDir = ``; // убрать - замена на hidden

        debug(`ClassInit::     HOST: ${args.host}  PORT: ${args.port}  ROOT_DIR: ${args.rootDir}`, 'constructor');
        debug(`Environment::   HOST: ${process.env.HOST}  PORT: ${process.env.PORT}  ROOT_DIR: ${process.env.ROOT_DIR}`, 'constructor');
        debug(`Config.json::   HOST: ${hostname}  PORT: ${port}  ROOT_DIR: ${dirname}`, 'constructor');
        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`, 'constructor');
    }

    _configureUpload () {
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                debug(`./${this.rootDir}${this.currentDir}`, '_configureUpload.destination');
                cb(null, `./${this.rootDir}${this.currentDir}`);
            },
            filename: (req, file, cb) => {
                debug(file.originalname, '_configureUpload.filename');
                const newName = `${Math.random().toString(36).substring(7)}_${file.originalname}`;
                //await this._getNewName(file.originalname);

                debug(newName, '_configureUpload.getNewName');
                cb(null, newName);
            }
        });
        debug(this.storage, '_configureUpload');
        this.upload = multer({ storage: this.storage });//, limits: { fieldSize: 10000 } });
        this.app.post('/', this.upload.single('fileToUpload'), this._upload);
    }

    _upload (req, res ) { // , err => {}
        debug(req.file, 'POST.file');
        res.redirect(req.get('referer'));
    }

    // async _getNewName (fileName) {
    //     // debug(fileName, '_getNewName');
    //     // const listDirFiles = await this._getDir( this.rootDir, this.currentDir, 'utf-8' );
    //
    //     // debug(listDirFiles, '_getNewName.listDirFiles');
    //     // const isFileNameMatch = listDirFiles.files.some( file => {
    //     //     return file === fileName;
    //     // });
    //     //
    //     // debug(isFileNameMatch, '_getNewName');
    //     // return isFileNameMatch ? `${Math.random().toString(36).substring(7)}_${fileName}` : fileName;
    // }

    _getHTMLDirList (subdir, listFiles) {
        debug(listFiles, '_getHTMLDirList');
        let data = `<h2>List Files in <i>${this.rootDir}${subdir}</i>:</h2>`;

        debug(listFiles.dirs, '_getHTMLDirList.dir');
        data += `<ul>`;
        for (const item of listFiles.dirs)
            data += `<li> <b>${item}</b>> (<A href="http://${this.host}:${this.port}${subdir}${item}">open</A>)</li>`;

        debug(listFiles.files, '_getHTMLDirList.files');
        for (const item of listFiles.files) {
            data += `<li> ${item} (<A href="http://${this.host}:${this.port}${subdir}${item}">open</A>)` +
                    `(<A href="http://${this.host}:${this.port}${subdir}${item}" download>download</A>)</li>`;
        }
        data += `</ul>`;

        // Add Upload form
        data += '<br>';
        data += `
        <form action="/" enctype="multipart/form-data" method="post">
          <input type="hidden" name="subdir" value="${subdir}"">
          <input type="file" name="fileToUpload" value="Select file">
          <input type="submit" value="Upload to server">
        </form>`;

        return data;
    }

    _resDirListFiles (req, res, next, subdir = '') {
        let data;

        subdir = req.url;

        debug(`Export::        HOST: ${this.host}  PORT: ${this.port}  ROOT_DIR: ${this.rootDir}`, '_resDirListFiles');
        debug(`Dir: ${subdir}  req url: ${req.url}`, '_resDirListFiles');
        debug(`#getDir( ${this.rootDir} + ${subdir} = ${this.rootDir.concat(subdir)} )`, '_resDirListFiles');

        getDir(this.rootDir.concat(subdir), 'utf-8')
            .then(files => {
                const listDirAndFiles = getListDirAndFiles(this.rootDir.concat(subdir), files);

                data = this._getHTMLDirList(subdir, listDirAndFiles);
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

    _initApp () {
        this.app = express();
        this.server = null;

        for (const path of this.dirPaths) {
            this.app.use(path, express.static(this.rootDir + path));
            this.app.get(path, this._resDirListFiles.bind(this) );
        }
    }

    async start () {
        if (this.isRunning)
            return Promise.reject( new Error(`Server is already running.`) );

        this.dirPaths = await getListSubDirectories(this.rootDir);
        this._initApp();
        this._configureUpload();

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
