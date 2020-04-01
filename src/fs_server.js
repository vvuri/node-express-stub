import express from 'express';

import { rootDir, filesDir } from './fs_tools';
import { HOST, PORT } from './fs_config';

const app = express();

app.get('/', rootDir);
app.get('/:id', filesDir);
app.get('/elements/:id', filesDir);
app.get('/elements/subelements/:id', filesDir);

app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});

export default app;
