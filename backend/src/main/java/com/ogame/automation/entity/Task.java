package com.ogame.automation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "task")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.CREATED;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "universe_id", nullable = false)
    @JsonBackReference("universe-tasks")
    private Universe universe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bot_id")
    @JsonBackReference("bot-tasks")
    private Bot bot;

    @Size(max = 100)
    @Column(name = "player_name")
    private String playerName;

    @Column(columnDefinition = "JSON")
    private String parameters;

    @Column(name = "recurrence_minutes")
    private Integer recurrenceMinutes;

    @Column(name = "next_execution_at")
    private LocalDateTime nextExecutionAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("task-results")
    private List<TaskResult> results;

    public enum TaskType {
        CHECK_ACTIVITY, SPY_PLAYER
    }

    public enum TaskStatus {
        CREATED, IN_PROGRESS, FINISHED, ERROR
    }

    // Constructors
    public Task() {}

    public Task(TaskType type, Universe universe, String playerName) {
        this.type = type;
        this.universe = universe;
        this.playerName = playerName;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void markInProgress(Bot bot) {
        this.status = TaskStatus.IN_PROGRESS;
        this.bot = bot;
        this.startedAt = LocalDateTime.now();
    }

    public void markFinished() {
        this.status = TaskStatus.FINISHED;
        this.finishedAt = LocalDateTime.now();
        scheduleNextExecution();
    }

    public void markError() {
        this.status = TaskStatus.ERROR;
        this.finishedAt = LocalDateTime.now();
        scheduleNextExecution();
    }

    private void scheduleNextExecution() {
        if (recurrenceMinutes != null && recurrenceMinutes > 0) {
            this.nextExecutionAt = LocalDateTime.now().plusMinutes(recurrenceMinutes);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Universe getUniverse() {
        return universe;
    }

    public void setUniverse(Universe universe) {
        this.universe = universe;
    }

    public Bot getBot() {
        return bot;
    }

    public void setBot(Bot bot) {
        this.bot = bot;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public String getParameters() {
        return parameters;
    }

    public void setParameters(String parameters) {
        this.parameters = parameters;
    }

    public Integer getRecurrenceMinutes() {
        return recurrenceMinutes;
    }

    public void setRecurrenceMinutes(Integer recurrenceMinutes) {
        this.recurrenceMinutes = recurrenceMinutes;
    }

    public LocalDateTime getNextExecutionAt() {
        return nextExecutionAt;
    }

    public void setNextExecutionAt(LocalDateTime nextExecutionAt) {
        this.nextExecutionAt = nextExecutionAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public List<TaskResult> getResults() {
        return results;
    }

    public void setResults(List<TaskResult> results) {
        this.results = results;
    }
}
