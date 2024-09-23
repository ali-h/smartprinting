import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ip from 'ip';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import userRoutes from './routes/user.js';
import printingRoutes from './routes/printing.js';

app.use('/user', userRoutes);
app.use('/api', printingRoutes);

app.listen(port, () => {
  console.log(`Server is running on address: ${ip.address()}:${port}`);
});
