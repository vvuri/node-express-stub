import dotenv from 'dotenv';

import debug from './fs_logger';

dotenv.config();
debug(`HOST: ${process.env.HOST}\nPORT: ${process.env.PORT}\nROOT_DIR: ${process.env.ROOT_DIR}`);

let error = false;

if (typeof process.env.HOST === 'undefined')
    error = 'HOST not allow';

if (typeof process.env.PORT === 'undefined')
    error = 'PORT not allow';

if (typeof process.env.ROOT_DIR === 'undefined')
    error = 'ROOT_DIR not allow';

if (error) {
    console.log(`\x1b[31mError: ${error}\x1b[0m\nPlease rename .env_simle to .env and restart server\n`);
    console.log(`HOST: ${process.env.HOST}\nPORT: ${process.env.PORT}\nROOT_DIR: ${process.env.ROOT_DIR}`);
    // eslint-disable-next-line
    process.exit();
}

export const HOST = process.env.HOST;
export const PORT = process.env.PORT;
export const ROOT_DIR = process.env.ROOT_DIR;
