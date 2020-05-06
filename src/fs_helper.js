import fs from 'fs';
import debug from './fs_logger';
import util from 'util';

const fsStat = util.promisify(fs.stat);
const fsReaddir = util.promisify(fs.readdir);

const statDir = fileName => {
    return fsStat(fileName)
        .catch( err => {
            debug(err, 'statDir.error');
            return err;
        });
};

export const getDir = ( folder, enconding ) => {
    return fsReaddir( folder, enconding )
        .catch( err => {
            debug(err, 'getDir.error');
            return err;
        });
};

export const getListSubDirectories = (rootDir, dirPath, subdir = '') => {
    return getDir(rootDir.concat(subdir), 'utf-8')
        .then(files => {
            return Promise.all(files.map(fileName => {
                return statDir(`${rootDir}${subdir}/${fileName}`)
                    .then( stat => {
                        let findSub = null;

                        if (stat.isDirectory()) {
                            debug(`${subdir}/${fileName}`, 'getListSubDirectories');
                            dirPath.push(`${subdir}/${fileName}`);
                            findSub = getListSubDirectories(rootDir, dirPath, `${subdir}/${fileName}`);
                        }
                        return findSub;
                    });
            }))
                .catch( err => {
                    debug(err, 'getListSubDirectories.Promise.all');
                    return err;
                });
        });
};
