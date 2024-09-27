import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expressWs from 'express-ws';
import { addConnection, removeConnection } from './config/websocket.js';
import jwt from 'jsonwebtoken';
import { setTerminalPingConnection } from './config/websocket.js';

dotenv.config();

const app = express();
expressWs(app);
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import userRoutes from './routes/user.js';
import apiRoutes from './routes/api.js';
import terminalRoutes from './routes/terminal.js';

app.use('/user', userRoutes);
app.use('/api', apiRoutes);
app.use('/terminal', terminalRoutes);

// Add WebSocket route with authentication
app.ws('/updates', (ws, req) => {
  let authenticated = false;
  let username = null;

  ws.on('message', (msg) => {
    if (!authenticated) {
      try {
        const { token } = JSON.parse(msg);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        username = decoded.username;
        authenticated = true;
        addConnection(username, ws);
        console.log(`WebSocket authenticated for user: ${username}`);
        ws.send(JSON.stringify({ type: 'authentication', status: 'success' }));
      } catch (error) {
        console.error('WebSocket authentication failed:', error);
        ws.send(JSON.stringify({ type: 'authentication', status: 'failed' }));
        ws.close();
      }
    }
  });
});

// WebSocket route for terminal updates (ping)
app.ws('/ping', (ws, req) => {
  setTerminalPingConnection(ws);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
