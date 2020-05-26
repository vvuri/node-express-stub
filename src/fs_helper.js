import fs from 'fs';
import debug from './fs_logger';
import path from 'path';
import util from 'util';

const fsReaddir = util.promisify(fs.readdir);
const fsStat = util.promisify(fs.stat);

export const getDir = ( folder, enconding = 'utf-8' ) => {
    const result = { dirs: [], files: [] };

    return fsReaddir( folder, enconding )
        .then( listFiles => {
            listFiles.forEach( fileName => {
                try {
                    const currentPath = path.join(folder, fileName);
                    const stats = fs.lstatSync(currentPath);

                    debug(currentPath, 'getDir.currentPath');
                    if (stats.isDirectory())
                        result.dirs.push(fileName);
                    if (stats.isFile())
                        result.files.push(fileName);
                }
                catch (e) {
                    debug(`Error in fs.lstatSync: ${e.message}`, 'getDir.error');
                }
            });

            debug(JSON.stringify(result), 'getDir.result');
            return result;
        })
        .catch( err => {
            debug(err, 'getDir.error');
            throw err.message;
        });
};

export const getListSubDirectories = async (rootDir, subdir = '', dirPaths = ['/']) => {
    const currentPath = path.join(rootDir, subdir);

    debug(`rootDir: ${rootDir}, subdir: ${subdir} = currentPath: ${currentPath}`, 'getListSubDirectories');
    const fileList = await getDir( currentPath )
        .catch( err => {
            console.log(`Error read ${currentPath}: ${err}`);
            throw err;
        });

    await Promise.all( fileList.dirs.map( async fileName => {
        debug( fileName, 'getListSubDirectories.map' );
        const currentSubPath = `${subdir}/${fileName}`;

        dirPaths.push( currentSubPath );
        await getListSubDirectories( rootDir, currentSubPath, dirPaths );
    }))
        .catch( err => {
            debug( err, 'getListSubDirectories.Promise.all' );
            console.log(`Error read subdirectories in ${currentPath}: ${err.message}`);
            throw err.message;
        });

    return dirPaths;
};

export const getNewFileName = async (fileName, pathToFile) => {
    debug(`fileName:${fileName}  pathToFile: ${pathToFile}`, 'getNewName');
    try {
        await fsStat( path.join(pathToFile, fileName) );
        fileName = await getNewFileName( `${Math.random().toString(36).substring(7)}_${fileName}`, pathToFile );
    }
    catch (err) {
        debug(err.message, 'getNewName.err');
    }

    debug(fileName, 'getNewName.return');
    return fileName;
    // debug(`fileName:${fileName}  pathToFile: ${pathToFile}`, 'getNewName');
    // const listDirFiles = await getDir( pathToFile );
    // const isFileNameMatch = listDirFiles.files.some( file => {
    //     return file === fileName;
    // });
    //
    // return isFileNameMatch ? `${Math.random().toString(36).substring(7)}_${fileName}` : fileName;
};
