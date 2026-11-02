// In-memory stand-in for @netlify/blobs, used only by test/handlers-test.mjs.
// Shared via globalThis because each bundled function gets its own copy of this module.
const data = (globalThis.__mockBlobs ??= new Map());
export function getStore() {
  return {
    setJSON: async (k, v) => void data.set(k, JSON.stringify(v)),
    get: async (k) => (data.has(k) ? JSON.parse(data.get(k)) : null),
    list: async () => ({ blobs: [...data.keys()].map((key) => ({ key })) }),
    delete: async (k) => void data.delete(k),
  };
}
