import fs from 'fs';
import debug from './fs_logger';
import path from 'path';
import util from 'util';

const fsReaddir = util.promisify(fs.readdir);

export const getDirectorySources = ( folder, enconding = 'utf-8' ) => {
    const result = { dirs: [], files: [] };

    return fsReaddir( folder, enconding )
        .then( listFilesAndDirs => {
            listFilesAndDirs.forEach( fileName => {
                try {
                    const currentPath = path.join(folder, fileName);
                    const stats = fs.lstatSync(currentPath);

                    debug(currentPath, 'getDirectorySources.currentPath');
                    if (stats.isDirectory())
                        result.dirs.push(fileName);
                    if (stats.isFile())
                        result.files.push(fileName);
                }
                catch (e) {
                    debug(`Error in fs.lstatSync: ${e.message}`, 'getDirectorySources.error');
                }
            });

            debug(JSON.stringify(result), 'getDirectorySources.result');
            return result;
        })
        .catch( err => {
            debug(err, 'getDirectorySources.error');
            throw err.message;
        });
};

export const getSubDirectoryUrlsRecursive = async (rootDir, subdir = '', dirPaths = ['/']) => {
    const currentPath = path.join(rootDir, subdir);

    debug(`rootDir: ${rootDir}, subdir: ${subdir} = currentPath: ${currentPath}`, 'getListSubDirectories');
    const fileList = await getDirectorySources( currentPath )
        .catch( err => {
            console.log(`Error read ${currentPath}: ${err}`);
            throw err;
        });

    await Promise.all( fileList.dirs.map( async fileName => {
        debug( fileName, 'getListSubDirectories.map' );
        const currentSubPath = `${subdir}/${fileName}`;

        dirPaths.push( currentSubPath );
        await getSubDirectoryUrlsRecursive( rootDir, currentSubPath, dirPaths );
    }))
        .catch( err => {
            debug( err, 'getListSubDirectories.Promise.all' );
            console.log(`Error read subdirectories in ${currentPath}: ${err.message}`);
            throw err.message;
        });

    return dirPaths;
};

export const getNewFileName = (fileName, pathToFile, copy = 0) => {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    let fileCandidate = copy === 0 ? fileName : `${base} (${copy})${ext}`;

    debug(`${pathToFile} : ${fileName} = ${base} + ${copy} + ${ext}`, 'getNewName');
    try {
        fs.lstatSync( path.join(pathToFile, fileCandidate) );

        fileCandidate = getNewFileName( fileName, pathToFile, copy + 1 );
    }
    catch (err) {
        debug(err.message, 'getNewName.err');
    }

    debug(fileCandidate, 'getNewName.return');
    return fileCandidate;
};
