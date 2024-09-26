import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import userRoutes from './routes/user.js';
import apiRoutes from './routes/api.js';
import terminalRoutes from './routes/terminal.js';

app.use('/user', userRoutes);
app.use('/api', apiRoutes);
app.use('/terminal', terminalRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
