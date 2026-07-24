if (!global.sessions) {
  global.sessions = new Map();
}

export function setSession(token, email) {
  global.sessions.set(token, email);
}

export function getSession(token) {
  return global.sessions.get(token);
}

export function deleteSession(token) {
  global.sessions.delete(token);
}
