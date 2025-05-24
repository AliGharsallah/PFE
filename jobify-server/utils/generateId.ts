// src/utils/generateId.ts

let messageCounter = 0;

export const generateMessageId = () => {
  messageCounter += 1;
  return `message-${Date.now()}-${messageCounter}`;
};