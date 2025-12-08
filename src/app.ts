import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
import responseMiddleware from './middleware/response.middleware';
app.use(responseMiddleware);

// Auth Middleware is now applied in routes/index.ts or specific route files.

// Routes
app.use('/api/v1', routes);

// Health Check
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root Route
app.get('/', (req: Request, res: Response) => {
    res.send('Vedincharyaa API is running');
});

export default app;
