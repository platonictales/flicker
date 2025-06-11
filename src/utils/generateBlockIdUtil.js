export function generateBlockId() {
  return `block_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}