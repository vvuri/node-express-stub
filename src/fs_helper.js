import fs from 'fs';
import debug from './fs_logger';
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

export const getDir = ( folder, enconding ) => {
    return fsReaddir( folder, enconding )
        .catch( err => {
            debug(err, 'getDir.error');
            throw err.message;
        });
};

const dirPaths = ['/'];

export const getListSubDirectories = async (rootDir, subdir = '') => {
    debug(`rootDir: ${rootDir}, subdir: ${subdir}`, 'getListSubDirectories');
    const files = await getDir( rootDir.concat(subdir), 'utf-8')
        .catch( err => {
            console.log(`Error read ${rootDir.concat(subdir)}: ${err}`);
            throw err;
        });

    await Promise.all( files.map( async fileName => {
        const stat = await statDir(`${rootDir}${subdir}/${fileName}`);

        if ( stat.isDirectory() ) {
            dirPaths.push( `${subdir}/${fileName}` );
            await getListSubDirectories( rootDir, `${subdir}/${fileName}` );
        }
    }))
        .catch( err => {
            debug( err, 'getListSubDirectories.Promise.all' );
            console.log(`Error read subdirectories in ${rootDir.concat(subdir)}: ${err.message}`);
            throw err.message;
        });

    return dirPaths;
};
