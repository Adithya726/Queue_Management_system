package com.que;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.que.dto.AnalyticsResponse;
import com.que.dto.QueueOverviewResponse;
import com.que.dto.QueueRequest;
import com.que.dto.RegisterRequest;
import com.que.dto.TokenRequest;
import com.que.dto.TokenResponse;
import com.que.exception.BadRequestException;
import com.que.exception.ResourceNotFoundException;
import com.que.model.TokenStatus;
import com.que.service.AnalyticsService;
import com.que.service.AuthService;
import com.que.service.QueueService;
import com.que.service.TokenService;

/**
 * Runs the real services, repositories and SQL against an in-memory database:
 * the full counter flow, ownership, and two concurrency checks.
 */
@SpringBootTest
class QueueFlowIntegrationTest {

    @Autowired
    private AuthService authService;
    @Autowired
    private QueueService queueService;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private AnalyticsService analyticsService;

    private String email;

    @BeforeEach
    void registerManager() {
        email = "m" + System.nanoTime() + "@test.com";
        RegisterRequest req = new RegisterRequest();
        req.setName("Manager");
        req.setEmail(email);
        req.setPassword("secret12");
        authService.register(req);
        loginAs(email);
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private static void loginAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of()));
    }

    private Long newQueue(String name) {
        QueueRequest q = new QueueRequest();
        q.setName(name);
        return queueService.createQueue(q).getId();
    }

    private TokenResponse add(Long queueId, String name) {
        TokenRequest r = new TokenRequest();
        r.setPersonName(name);
        return tokenService.addToken(queueId, r);
    }

    private List<String> waitingNames(Long queueId) {
        return tokenService.getTokens(queueId).stream()
                .filter(t -> t.getStatus() == TokenStatus.WAITING)
                .map(TokenResponse::getPersonName)
                .toList();
    }

    @Test
    void fullCounterFlow() {
        Long queueId = newQueue("Billing");

        TokenResponse a = add(queueId, "Asha");
        TokenResponse b = add(queueId, "Ben");
        TokenResponse c = add(queueId, "Chen");
        assertThat(List.of(a.getTokenNumber(), b.getTokenNumber(), c.getTokenNumber()))
                .containsExactly(1, 2, 3);

        tokenService.moveToken(c.getId(), "UP");
        assertThat(waitingNames(queueId)).containsExactly("Asha", "Chen", "Ben");

        tokenService.cancelToken(a.getId());
        assertThat(waitingNames(queueId)).containsExactly("Chen", "Ben");

        TokenResponse serving = tokenService.serveNext(queueId);
        assertThat(serving.getPersonName()).isEqualTo("Chen");
        assertThatThrownBy(() -> tokenService.serveNext(queueId))
                .isInstanceOf(BadRequestException.class);

        tokenService.completeToken(serving.getId());
        assertThat(tokenService.serveNext(queueId).getPersonName()).isEqualTo("Ben");

        // Token numbers keep counting after cancellations.
        assertThat(add(queueId, "Dev").getTokenNumber()).isEqualTo(4);

        AnalyticsResponse stats = analyticsService.getAnalytics(queueId);
        assertThat(stats.getTotalServed()).isEqualTo(1);
        assertThat(stats.getTotalCancelled()).isEqualTo(1);
        assertThat(stats.getCurrentQueueLength()).isEqualTo(1);
        assertThat(stats.getPeakQueueLength()).isEqualTo(3);

        QueueOverviewResponse overview = queueService.getOverview().get(0);
        assertThat(overview.getWaitingCount()).isEqualTo(1);
        assertThat(overview.getServing().getPersonName()).isEqualTo("Ben");
        assertThat(overview.getNext().getPersonName()).isEqualTo("Dev");
    }

    @Test
    void anotherManagerCannotSeeOrChangeTheQueue() {
        Long queueId = newQueue("Private");
        TokenResponse t = add(queueId, "Asha");

        RegisterRequest other = new RegisterRequest();
        other.setName("Other");
        other.setEmail("o" + System.nanoTime() + "@test.com");
        other.setPassword("secret12");
        authService.register(other);
        loginAs(other.getEmail());

        assertThat(queueService.getMyQueues()).isEmpty();
        assertThatThrownBy(() -> tokenService.getTokens(queueId)).isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> tokenService.serveNext(queueId)).isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> tokenService.cancelToken(t.getId())).isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> analyticsService.getAnalytics(queueId)).isInstanceOf(ResourceNotFoundException.class);
    }

    private <T> List<Future<T>> runAtOnce(int threads, Callable<T> task) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<T>> results = new ArrayList<>();
        String user = email;
        for (int i = 0; i < threads; i++) {
            results.add(pool.submit(() -> {
                loginAs(user);
                start.await();
                return task.call();
            }));
        }
        start.countDown();
        pool.shutdown();
        return results;
    }

    @Test
    void concurrentAdds_neverRepeatATokenNumber() throws Exception {
        Long queueId = newQueue("Rush");

        List<Future<TokenResponse>> results = runAtOnce(10, () -> add(queueId, "Person"));

        List<Integer> numbers = new ArrayList<>();
        for (Future<TokenResponse> f : results) {
            numbers.add(f.get().getTokenNumber());
        }
        assertThat(numbers).doesNotHaveDuplicates().hasSize(10);
        assertThat(numbers).containsExactlyInAnyOrder(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    }

    @Test
    void concurrentServeNext_callsOnlyOnePerson() throws Exception {
        Long queueId = newQueue("Counter");
        for (int i = 0; i < 5; i++) {
            add(queueId, "P" + i);
        }

        List<Future<Boolean>> results = runAtOnce(5, () -> {
            try {
                tokenService.serveNext(queueId);
                return true;
            } catch (BadRequestException e) {
                return false;
            }
        });

        int succeeded = 0;
        for (Future<Boolean> f : results) {
            if (f.get()) {
                succeeded++;
            }
        }
        long servingNow = tokenService.getTokens(queueId).stream()
                .filter(t -> t.getStatus() == TokenStatus.SERVING).count();

        assertThat(succeeded).isEqualTo(1);
        assertThat(servingNow).isEqualTo(1);
    }
}
