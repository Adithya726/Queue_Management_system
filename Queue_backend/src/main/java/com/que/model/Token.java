
package com.que.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tokens",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_token_queue_number",
                columnNames = {"queue_id", "token_number"}),
        indexes = @Index(
                name = "idx_token_queue_status_position",
                columnList = "queue_id, status, position"))
@Getter
@Setter
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_number", nullable = false)
    private Integer tokenNumber;

    @Column(name = "person_name", nullable = false, length = 100)
    private String personName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenStatus status;

    @Column(nullable = false)
    private Integer position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "queue_id", nullable = false)
    private Queue queue;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "serving_started_at")
    private LocalDateTime servingStartedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = TokenStatus.WAITING;
        }
    }
}
