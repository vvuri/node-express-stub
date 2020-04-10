import fs from 'fs';
import util from 'util';

const logFile = fs.createWriteStream('../debug.log', { flags: 'w' });

export default function debug (str) {
    logFile.write(util.format(str) + '\n');
}
