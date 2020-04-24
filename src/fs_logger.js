import fs from 'fs';
import util from 'util';

const logFile = fs.createWriteStream('./debug.log', { flags: 'w' });

export default function debug (str, module = 'srv') {
    const time = new Date().toLocaleString();

    logFile.write(`${time} [${module}] ${util.format(str)}\n`);
}
