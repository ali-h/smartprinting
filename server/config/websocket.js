const connections = new Map();
let terminalPingConnection = null;

export const addConnection = (username, ws) => {
  connections.set(username, ws);
};

export const removeConnection = (username) => {
  connections.delete(username);
};

export const getConnection = (username) => {
  return connections.get(username);
};

export const sendUpdate = (username, data) => {
  const ws = getConnection(username);
  if (ws) {
    ws.send(JSON.stringify(data));
  }
};

export const setTerminalPingConnection = (ws) => {
  terminalPingConnection = ws;
};

export const sendTerminalPing = (data) => {
  if (terminalPingConnection) {
    terminalPingConnection.send(JSON.stringify(data));
  }
};


