package com.que.service;

import java.util.List;

import com.que.dto.TokenRequest;
import com.que.dto.TokenResponse;

public interface TokenService {

    TokenResponse addToken(Long queueId, TokenRequest request);

    List<TokenResponse> getTokens(Long queueId);

    TokenResponse moveToken(Long tokenId, String direction);

    TokenResponse serveNext(Long queueId);

    TokenResponse completeToken(Long tokenId);

    TokenResponse cancelToken(Long tokenId);
}