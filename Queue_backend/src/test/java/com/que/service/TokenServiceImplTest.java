package com.que.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.que.dto.TokenRequest;
import com.que.dto.TokenResponse;
import com.que.exception.BadRequestException;
import com.que.exception.ResourceNotFoundException;
import com.que.model.Manager;
import com.que.model.Queue;
import com.que.model.Token;
import com.que.model.TokenStatus;
import com.que.repository.QueueRepository;
import com.que.repository.TokenRepository;

/** Unit tests for the queue rules, with the repositories mocked. */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TokenServiceImplTest {

    private static final long MANAGER_ID = 1L;
    private static final long QUEUE_ID = 10L;

    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private QueueRepository queueRepository;
    @Mock
    private CurrentManagerProvider currentManager;

    @InjectMocks
    private TokenServiceImpl service;

    private Queue queue;

    @BeforeEach
    void setUp() {
        Manager manager = new Manager();
        manager.setId(MANAGER_ID);
        when(currentManager.get()).thenReturn(manager);

        queue = new Queue();
        queue.setId(QUEUE_ID);
        queue.setManager(manager);
        when(queueRepository.findOwnedForUpdate(QUEUE_ID, MANAGER_ID)).thenReturn(Optional.of(queue));
        when(queueRepository.findByIdAndManagerId(QUEUE_ID, MANAGER_ID)).thenReturn(Optional.of(queue));
        when(tokenRepository.save(any(Token.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private Token token(long id, int number, TokenStatus status, int position) {
        Token t = new Token();
        t.setId(id);
        t.setTokenNumber(number);
        t.setPersonName("P" + number);
        t.setStatus(status);
        t.setPosition(position);
        t.setQueue(queue);
        when(tokenRepository.findById(id)).thenReturn(Optional.of(t));
        when(tokenRepository.findQueueIdByTokenId(id)).thenReturn(Optional.of(QUEUE_ID));
        return t;
    }

    private void waitingList(Token... tokens) {
        when(tokenRepository.findByQueueIdAndStatusOrderByPositionAsc(QUEUE_ID, TokenStatus.WAITING))
                .thenReturn(new ArrayList<>(List.of(tokens)));
    }

    private static TokenRequest request(String name) {
        TokenRequest r = new TokenRequest();
        r.setPersonName(name);
        return r;
    }

    // ---- add ----

    @Test
    void addToken_givesNextNumberAndJoinsAtTheEnd() {
        waitingList(token(1, 1, TokenStatus.WAITING, 1), token(2, 2, TokenStatus.WAITING, 2));
        when(tokenRepository.findMaxTokenNumber(QUEUE_ID)).thenReturn(5);

        TokenResponse added = service.addToken(QUEUE_ID, request("  Asha  "));

        assertThat(added.getTokenNumber()).isEqualTo(6);
        assertThat(added.getPosition()).isEqualTo(3);
        assertThat(added.getPersonName()).isEqualTo("Asha");
        assertThat(added.getStatus()).isEqualTo(TokenStatus.WAITING);
    }

    @Test
    void addToken_firstPersonGetsTokenOneAtPositionOne() {
        waitingList();
        when(tokenRepository.findMaxTokenNumber(QUEUE_ID)).thenReturn(0);

        TokenResponse added = service.addToken(QUEUE_ID, request("Ravi"));

        assertThat(added.getTokenNumber()).isEqualTo(1);
        assertThat(added.getPosition()).isEqualTo(1);
    }

    @Test
    void addToken_locksTheQueueRow() {
        waitingList();
        service.addToken(QUEUE_ID, request("Ravi"));
        verify(queueRepository).findOwnedForUpdate(QUEUE_ID, MANAGER_ID);
    }

    @Test
    void addToken_toAnotherManagersQueue_isNotFound() {
        when(queueRepository.findOwnedForUpdate(99L, MANAGER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.addToken(99L, request("X")))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(tokenRepository, never()).save(any());
    }

    // ---- move ----

    @Test
    void moveUp_swapsWithThePersonAhead() {
        Token a = token(1, 1, TokenStatus.WAITING, 1);
        Token b = token(2, 2, TokenStatus.WAITING, 2);
        Token c = token(3, 3, TokenStatus.WAITING, 3);
        waitingList(a, b, c);

        service.moveToken(3L, "UP");

        assertThat(c.getPosition()).isEqualTo(2);
        assertThat(b.getPosition()).isEqualTo(3);
        assertThat(a.getPosition()).isEqualTo(1);
    }

    @Test
    void moveDown_swapsWithThePersonBehind() {
        Token a = token(1, 1, TokenStatus.WAITING, 1);
        Token b = token(2, 2, TokenStatus.WAITING, 2);
        waitingList(a, b);

        service.moveToken(1L, "down");

        assertThat(a.getPosition()).isEqualTo(2);
        assertThat(b.getPosition()).isEqualTo(1);
    }

    @Test
    void move_matchesByIdNotByObjectIdentity() {
        Token loaded = token(2, 2, TokenStatus.WAITING, 2);
        // The list holds different instances with the same ids, as a fresh query could return.
        Token a = new Token();
        a.setId(1L);
        a.setPosition(1);
        a.setStatus(TokenStatus.WAITING);
        Token sameAsLoaded = new Token();
        sameAsLoaded.setId(2L);
        sameAsLoaded.setPosition(2);
        sameAsLoaded.setStatus(TokenStatus.WAITING);
        waitingList(a, sameAsLoaded);

        service.moveToken(loaded.getId(), "UP");

        assertThat(sameAsLoaded.getPosition()).isEqualTo(1);
        assertThat(a.getPosition()).isEqualTo(2);
    }

    @Test
    void moveUp_atTheTop_isRejected() {
        Token a = token(1, 1, TokenStatus.WAITING, 1);
        waitingList(a, token(2, 2, TokenStatus.WAITING, 2));

        assertThatThrownBy(() -> service.moveToken(1L, "UP"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("further");
    }

    @Test
    void moveDown_atTheBottom_isRejected() {
        waitingList(token(1, 1, TokenStatus.WAITING, 1), token(2, 2, TokenStatus.WAITING, 2));

        assertThatThrownBy(() -> service.moveToken(2L, "DOWN"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void move_withInvalidDirection_isRejected() {
        token(1, 1, TokenStatus.WAITING, 1);

        assertThatThrownBy(() -> service.moveToken(1L, "SIDEWAYS"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Invalid direction");
    }

    @Test
    void move_aServingToken_isRejected() {
        token(1, 1, TokenStatus.SERVING, 1);

        assertThatThrownBy(() -> service.moveToken(1L, "UP"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only waiting");
    }

    // ---- serve ----

    @Test
    void serveNext_callsTheTopWaitingToken() {
        Token top = token(1, 4, TokenStatus.WAITING, 1);
        when(tokenRepository.countByQueueIdAndStatus(QUEUE_ID, TokenStatus.SERVING)).thenReturn(0L);
        when(tokenRepository.findFirstByQueueIdAndStatusOrderByPositionAsc(QUEUE_ID, TokenStatus.WAITING))
                .thenReturn(Optional.of(top));

        TokenResponse served = service.serveNext(QUEUE_ID);

        assertThat(served.getTokenNumber()).isEqualTo(4);
        assertThat(top.getStatus()).isEqualTo(TokenStatus.SERVING);
        assertThat(top.getServingStartedAt()).isNotNull();
        verify(queueRepository).findOwnedForUpdate(QUEUE_ID, MANAGER_ID);
    }

    @Test
    void serveNext_whileSomeoneIsAtTheCounter_isRejected() {
        when(tokenRepository.countByQueueIdAndStatus(QUEUE_ID, TokenStatus.SERVING)).thenReturn(1L);

        assertThatThrownBy(() -> service.serveNext(QUEUE_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Complete the current token");
    }

    @Test
    void serveNext_onAnEmptyQueue_isRejected() {
        when(tokenRepository.countByQueueIdAndStatus(QUEUE_ID, TokenStatus.SERVING)).thenReturn(0L);
        when(tokenRepository.findFirstByQueueIdAndStatusOrderByPositionAsc(QUEUE_ID, TokenStatus.WAITING))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.serveNext(QUEUE_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Queue is empty");
    }

    // ---- complete ----

    @Test
    void complete_marksServedWithTimestamp() {
        Token t = token(1, 1, TokenStatus.SERVING, 1);

        service.completeToken(1L);

        assertThat(t.getStatus()).isEqualTo(TokenStatus.SERVED);
        assertThat(t.getCompletedAt()).isNotNull();
    }

    @Test
    void complete_aWaitingToken_isRejected() {
        token(1, 1, TokenStatus.WAITING, 1);

        assertThatThrownBy(() -> service.completeToken(1L))
                .isInstanceOf(BadRequestException.class);
    }

    // ---- cancel ----

    @Test
    void cancel_removesTokenAndShiftsLaterPeopleUp() {
        Token a = token(1, 1, TokenStatus.WAITING, 1);
        Token b = token(2, 2, TokenStatus.WAITING, 2);
        Token c = token(3, 3, TokenStatus.WAITING, 3);
        Token d = token(4, 4, TokenStatus.WAITING, 4);
        waitingList(a, b, c, d);

        service.cancelToken(2L);

        assertThat(b.getStatus()).isEqualTo(TokenStatus.CANCELLED);
        assertThat(b.getCancelledAt()).isNotNull();
        assertThat(a.getPosition()).isEqualTo(1);
        assertThat(c.getPosition()).isEqualTo(2);
        assertThat(d.getPosition()).isEqualTo(3);
    }

    @Test
    void cancel_aServingToken_isRejected() {
        token(1, 1, TokenStatus.SERVING, 1);

        assertThatThrownBy(() -> service.cancelToken(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only waiting");
    }

    @Test
    void cancel_unknownToken_isNotFound() {
        when(tokenRepository.findQueueIdByTokenId(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelToken(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cancel_tokenInAnotherManagersQueue_isNotFound() {
        when(tokenRepository.findQueueIdByTokenId(7L)).thenReturn(Optional.of(77L));
        when(queueRepository.findOwnedForUpdate(77L, MANAGER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelToken(7L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
