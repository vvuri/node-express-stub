import dotenv from 'dotenv';
import chalk from 'chalk';

import debug from './fs_logger';

dotenv.config();
debug(`HOST: ${process.env.HOST}\nPORT: ${process.env.PORT}\nROOT_DIR: ${process.env.ROOT_DIR}`);

const errors = [];

if (typeof process.env.HOST === 'undefined')
    errors.push(`Environment variable ${chalk.green('HOST')} not found`);

if (typeof process.env.PORT === 'undefined')
    errors.push(`Environment variable ${chalk.green('PORT')} not found`);

if (typeof process.env.ROOT_DIR === 'undefined')
    errors.push(`Environment variable ${chalk.green('ROOT_DIR')} not found`);

if (errors.length) {
    for (const error of errors)
        console.log(chalk.red('Error: ').concat(error));
    console.log(`\nHOST: ${process.env.HOST}\nPORT: ${process.env.PORT}\nROOT_DIR: ${process.env.ROOT_DIR}`);
    console.log(`\nPlease rename .env_simple to ${chalk.blue('.env')} and restart server\n`);

    // eslint-disable-next-line
    process.exit();
}

export const HOST = process.env.HOST;
export const PORT = process.env.PORT;
export const ROOT_DIR = process.env.ROOT_DIR;
