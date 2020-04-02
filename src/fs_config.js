import dotenv from 'dotenv';
import chalk from 'chalk';

import debug from './fs_logger';
import config from '../config.json';

const { hostname, port, dirname } = config;

dotenv.config();
debug(`Env::   HOST: ${process.env.HOST}  PORT: ${process.env.PORT}  ROOT_DIR: ${process.env.ROOT_DIR}`);
debug(`Json::  HOST: ${hostname}  PORT: ${port}  ROOT_DIR: ${dirname}`);

export let HOST = process.env.HOST;
export let PORT = process.env.PORT;
export let ROOT_DIR = process.env.ROOT_DIR;

// Add from config, if environment is null
const errors = [];

if (typeof process.env.HOST === 'undefined') {
    if (typeof hostname === 'undefined')
        errors.push(`Environment variable ${chalk.green('HOST')} not found`);
    else
        HOST = hostname;
}

if (typeof process.env.PORT === 'undefined') {
    if (typeof port === 'undefined')
        errors.push(`Environment variable ${chalk.green('PORT')} not found`);
    else
        PORT = port;
}

if (typeof process.env.ROOT_DIR === 'undefined') {
    if (typeof dirname === 'undefined')
        errors.push(`Environment variable ${chalk.green('ROOT_DIR')} not found`);
    else
        ROOT_DIR = dirname;
}

if (errors.length) {
    for (const error of errors)
        console.log(chalk.red('Error: ').concat(error));
    console.log(`\nHOST: ${process.env.HOST}\nPORT: ${process.env.PORT}\nROOT_DIR: ${process.env.ROOT_DIR}`);
    console.log(`\nPlease rename .env_simple to ${chalk.blue('.env')} and restart server\n`);

    // eslint-disable-next-line
    process.exit();
}
