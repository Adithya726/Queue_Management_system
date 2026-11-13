import api from './api';

const SERVING_STORAGE_KEY = 'qms_serving_tokens';

export function addToken(queueId, payload) {
  return api.post(`/api/queues/${queueId}/tokens`, payload);
}

export function getQueueTokens(queueId) {
  return api.get(`/api/queues/${queueId}/tokens`);
}

export function getWaitingTokens(queueId) {
  return getQueueTokens(queueId);
}

export function splitQueueTokens(tokens = []) {
  const waiting = tokens
    .filter((token) => !token.status || token.status === 'WAITING')
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  const serving =
    tokens.find((token) => token.status === 'SERVING') || null;

  return { waiting, serving };
}

export function moveToken(tokenId, direction) {
  return api.patch(`/api/tokens/${tokenId}/move`, null, {
    params: { direction },
  });
}

export function serveNextToken(queueId) {
  return api.post(`/api/queues/${queueId}/serve-next`);
}

export function completeToken(tokenId) {
  return api.post(`/api/tokens/${tokenId}/complete`);
}

export function cancelToken(tokenId) {
  return api.patch(`/api/tokens/${tokenId}/cancel`);
}

export function getServingTokens() {
  try {
    const raw = sessionStorage.getItem(SERVING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveServingToken(queueId, token) {
  const current = getServingTokens();
  current[String(queueId)] = token;
  sessionStorage.setItem(SERVING_STORAGE_KEY, JSON.stringify(current));
}

export function clearServingToken(queueId) {
  const current = getServingTokens();
  delete current[String(queueId)];
  sessionStorage.setItem(SERVING_STORAGE_KEY, JSON.stringify(current));
}
