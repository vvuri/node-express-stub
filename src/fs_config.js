import dotenv from 'dotenv';

import debug from './fs_logger';

dotenv.config();
debug(`HOST: ${process.env.HOST}\nPORT: ${process.env.PORT}\nROOT_DIR: ${process.env.ROOT_DIR}`);

export const HOST = process.env.HOST;
export const PORT = process.env.PORT;
export const ROOT_DIR = process.env.ROOT_DIR;
