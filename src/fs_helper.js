import fs from 'fs';
import debug from './fs_logger';
//mport util from 'util';

const statDir = fileName => {
    return new Promise((resolve, reject) => {
        fs.stat(fileName, (err, stat) => {
            if (err) {
                debug(err, '_statDir.error');
                reject(err);
            }
            else
                resolve(stat);
        });
    });
};

export const getDir = ( folder, subdir, enconding ) => {
    return new Promise((resolve, reject) => {
        fs.readdir(folder, enconding, (err, items) => {
            if (err) {
                debug(err, '_getDir.error');
                reject(err);
            }
            else
                resolve(items);
        });
    });
};

export const getListSubDirectories = (rootDir, dirPath, subdir = '') => {
    return getDir(rootDir.concat(subdir), subdir, 'utf-8')
        .then(files => {
            return Promise.all(files.map(fileName => {
                // eslint-disable-next-line
                return statDir(`${rootDir}${subdir}/${fileName}`).then( stat => {
                    if (stat.isDirectory()) {
                        debug(`${subdir}/${fileName}`, 'getListSubDirectories');
                        dirPath.push(`${subdir}/${fileName}`);
                        return getListSubDirectories(rootDir, dirPath, `${subdir}/${fileName}`);
                    }
                });
            }));
        });
};
