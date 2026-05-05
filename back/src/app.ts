import express from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import cityRoutes from './routes/cityRoutes';
import exchangesRoutes from './routes/exchangeRoutes';
import reviewRoutes from './routes/reviewRoutes';
import { errorHandler } from './middlewares/errorHandler';
import path from 'path';
import cors from 'cors';

const app = express();


app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', cityRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/exchanges', exchangesRoutes);
app.use('/api/reviews', reviewRoutes)

app.use(errorHandler);

export {app};