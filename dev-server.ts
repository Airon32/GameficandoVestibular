import { createServer as createViteServer } from 'vite';
import app from './server';

const port = Number(process.env.PORT) || 3000;
const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
app.use(vite.middlewares);
app.listen(port, '0.0.0.0', () => console.log(`Servidor local em http://0.0.0.0:${port}`));
