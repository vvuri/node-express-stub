import fs from 'fs';
import debug from './fs_logger';
import path from 'path';
import util from 'util';

const fsStat = util.promisify(fs.stat);
const fsReaddir = util.promisify(fs.readdir);

export const statDir = fileName => {
    return fsStat( fileName )
        .catch( err => {
            debug( err, 'statDir.error' );
            console.log(`Error getting information about a file:${fileName}: ${err.message}`);
            return {
                isDirectory: () => {
                    return false;
                },
                error: new Error(`Error getting information about a file:${fileName}: ${err.message}`)
            };
        });
};

export const getDir = ( folder, enconding = 'utf-8' ) => {
    return fsReaddir( folder, enconding )
        .catch( err => {
            debug(err, 'getDir.error');
            throw err.message;
        });
};

const dirPaths = ['/'];

export const getListSubDirectories = async (rootDir, subdir = '') => {
    const currentPath = path.join(rootDir, subdir);

    debug(`rootDir: ${rootDir}, subdir: ${subdir} = currentPath: ${currentPath}`, 'getListSubDirectories');
    const files = await getDir( currentPath )
        .catch( err => {
            console.log(`Error read ${currentPath}: ${err}`);
            throw err;
        });

    await Promise.all( files.map( async fileName => {
        const stat = await statDir(path.join(rootDir, subdir, fileName));

        if ( stat.isDirectory() ) {
            const currentSubPath = `${subdir}/${fileName}`;

            dirPaths.push( currentSubPath );
            await getListSubDirectories( rootDir, currentSubPath );
        }
    }))
        .catch( err => {
            debug( err, 'getListSubDirectories.Promise.all' );
            console.log(`Error read subdirectories in ${currentPath}: ${err.message}`);
            throw err.message;
        });

    return dirPaths;
};

export const getListDirAndFiles = (subdir, listFiles) => {
    const result = { dirs: [], files: [] };

    listFiles.forEach( fileName => {
        try {
            const currentPath = path.join(subdir, fileName);
            const stats = fs.lstatSync(currentPath);

            debug(currentPath, 'getListDirAndFiles');
            if (stats.isDirectory())
                result.dirs.push(fileName);
            if (stats.isFile())
                result.files.push(fileName);
        }
        catch (e) {
            debug(`Error in fs.lstatSync: ${e.message}`, 'getListDirAndFiles');
        }
    });

    debug(JSON.stringify(result), 'getListDirAndFiles');
    return result;
};

export const getNewFileName = async (fileName, pathToFile) => {
    debug(`fileName:${fileName}  pathToFile: ${pathToFile}`, 'getNewName');
    const listDirFiles = await getDir( pathToFile );

    debug(listDirFiles, 'getNewName.listDirFiles');
    const isFileNameMatch = listDirFiles.some( file => {
        return file === fileName;
    });

    return isFileNameMatch ? `${Math.random().toString(36).substring(7)}_${fileName}` : fileName;
};
