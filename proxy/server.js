/**
 * CM CLIENT 1.8.8 WEBSOCKET-TO-TCP BRIDGE PROXY
 * Enables web browser clients (WebSockets) to join real cracked Minecraft 1.8.8 Java servers (raw TCP).
 * Supports dynamic routing via query string: ws://localhost:8081/?target=mc.mineberry.org&port=25565
 */

const WebSocket = require('ws');
const net = require('net');

// Configuration
const WS_PORT = process.env.WS_PORT || 8081;
const DEFAULT_TARGET_HOST = process.env.TARGET_HOST || 'mc.mineberry.org';
const DEFAULT_TARGET_PORT = process.env.TARGET_PORT || 25565;

const wss = new WebSocket.Server({ port: WS_PORT }, () => {
  console.log(`=======================================================`);
  console.log(`[CM PROXY] WebSocket-to-TCP Bridge running on port ${WS_PORT}`);
  console.log(`[CM PROXY] Ready to bridge browser clients to Minecraft Java servers`);
  console.log(`[CM PROXY] Default destination: ${DEFAULT_TARGET_HOST}:${DEFAULT_TARGET_PORT}`);
  console.log(`[CM PROXY] Dynamic routing enabled (e.g., ?target=mc.mineberry.org)`);
  console.log(`=======================================================`);
});

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  
  // Parse dynamic target from URL query parameter
  let targetHost = DEFAULT_TARGET_HOST;
  let targetPort = DEFAULT_TARGET_PORT;

  try {
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const paramTarget = reqUrl.searchParams.get('target');
    const paramPort = reqUrl.searchParams.get('port');
    if (paramTarget) targetHost = paramTarget;
    if (paramPort) targetPort = parseInt(paramPort, 10);
  } catch (err) {
    // fallback to defaults
  }

  console.log(`[+] New browser client connected from ${clientIp} -> Routing to ${targetHost}:${targetPort}`);

  // Connect TCP socket to the target Minecraft server
  const mcSocket = new net.Socket();

  mcSocket.connect(targetPort, targetHost, () => {
    console.log(`[->] Connected to backend Minecraft server ${targetHost}:${targetPort} for client ${clientIp}`);
  });

  // Relay data: Browser (WebSocket) -> Minecraft Server (TCP)
  ws.on('message', (data, isBinary) => {
    if (mcSocket.writable) {
      mcSocket.write(data);
    }
  });

  // Relay data: Minecraft Server (TCP) -> Browser (WebSocket)
  mcSocket.on('data', (chunk) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk, { binary: true });
    }
  });

  // Error & close handling
  ws.on('close', () => {
    console.log(`[-] Browser client disconnected: ${clientIp}`);
    mcSocket.end();
  });

  ws.on('error', (err) => {
    console.error(`[!] WebSocket error for ${clientIp}:`, err.message);
    mcSocket.destroy();
  });

  mcSocket.on('error', (err) => {
    console.error(`[!] Minecraft TCP socket error for ${targetHost}:${targetPort}:`, err.message);
    ws.close();
  });

  mcSocket.on('close', () => {
    console.log(`[x] Backend Minecraft connection closed for ${clientIp}`);
    ws.close();
  });
});
