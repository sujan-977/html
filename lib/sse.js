if (!global.sseClients) {
  global.sseClients = new Set();
}

export function addClient(controller) {
  global.sseClients.add(controller);
}

export function removeClient(controller) {
  global.sseClients.delete(controller);
}

export function broadcastBooking(booking) {
  const encoder = new TextEncoder();
  const payload = `data: ${JSON.stringify(booking)}\n\n`;
  for (const client of global.sseClients) {
    try {
      client.enqueue(encoder.encode(payload));
    } catch (e) {
      global.sseClients.delete(client);
    }
  }
}
