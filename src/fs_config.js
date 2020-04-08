import dotenv from 'dotenv';

import debug from './fs_logger';
import config from '../config.json';

const { hostname, port, dirname } = config;

dotenv.config();
export const HOST = process.env.HOST || hostname;
export const PORT = process.env.PORT || port;
export const ROOT_DIR = process.env.ROOT_DIR || dirname;

debug(`Env::   HOST: ${process.env.HOST}  PORT: ${process.env.PORT}  ROOT_DIR: ${process.env.ROOT_DIR}`);
debug(`Json::  HOST: ${hostname}  PORT: ${port}  ROOT_DIR: ${dirname}`);
debug(`Export::  HOST: ${HOST}  PORT: ${PORT}  ROOT_DIR: ${ROOT_DIR}`);
