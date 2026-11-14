import api from './api';

export function addToken(queueId, payload) {
  return api.post(`/api/queues/${queueId}/tokens`, payload);
}

export function getQueueTokens(queueId) {
  return api.get(`/api/queues/${queueId}/tokens`);
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
