import crypto from "crypto";

const store = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (val.expiresAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export function createTelegramLink(userId) {
  const token = crypto.randomBytes(16).toString("hex");
  store.set(token, { userId, expiresAt: Date.now() + 15 * 60 * 1000 });
  return token;
}

export function consumeTelegramLink(token) {
  const data = store.get(token);
  if (!data) return null;
  if (data.expiresAt < Date.now()) {
    store.delete(token);
    return null;
  }
  store.delete(token);
  return data.userId;
}
