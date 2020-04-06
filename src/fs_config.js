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
export const errors = [];

const _checkEnvUndefined = (env, confenv, textname) => {
    if (typeof env === 'undefined') {
        if (typeof confenv === 'undefined')
            errors.push(`Environment variable ${chalk.green(textname)} not found`);
        return confenv;
    }
    return env;
};

HOST = _checkEnvUndefined(process.env.HOST, hostname, 'HOST');
PORT = _checkEnvUndefined(process.env.PORT, port, 'PORT');
ROOT_DIR = _checkEnvUndefined(process.env.ROOT_DIR, dirname, 'ROOT_DIR');

if (errors.length) {
    for (const error of errors)
        console.log(chalk.red('Error: ').concat(error));
    console.log(`\nHOST: ${process.env.HOST}\nPORT: ${process.env.PORT}\nROOT_DIR: ${process.env.ROOT_DIR}`);
    console.log(`\nPlease rename .env_simple to ${chalk.blue('.env')} and restart server\n`);
}
