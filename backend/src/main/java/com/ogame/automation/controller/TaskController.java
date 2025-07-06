package com.ogame.automation.controller;

import com.ogame.automation.entity.Task;
import com.ogame.automation.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Task management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    @Operation(summary = "Get all tasks", description = "Retrieve all tasks with optional pagination")
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Task> taskPage = taskService.getAllTasks(pageable);
        return ResponseEntity.ok(taskPage.getContent());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID", description = "Retrieve a specific task by its ID")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get tasks by status", description = "Retrieve tasks filtered by status")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable String status) {
        try {
            Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(status.toUpperCase());
            List<Task> tasks = taskService.getTasksByStatus(taskStatus);
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/universe/{universeId}")
    @Operation(summary = "Get tasks by universe", description = "Retrieve all tasks for a specific universe")
    public ResponseEntity<List<Task>> getTasksByUniverse(@PathVariable Long universeId) {
        List<Task> tasks = taskService.getTasksByUniverse(universeId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/universe/{universeId}/available")
    @Operation(summary = "Get available tasks", description = "Retrieve available tasks for bots to pick up")
    public ResponseEntity<List<Task>> getAvailableTasks(@PathVariable Long universeId) {
        List<Task> tasks = taskService.getAvailableTasks(universeId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    @Operation(summary = "Create new task", description = "Create a new task")
    public ResponseEntity<Task> createTask(@Valid @RequestBody CreateTaskRequest request) {
        try {
            Task task = taskService.createTask(
                request.getType(),
                request.getUniverseId(),
                request.getPlayerName(),
                request.getParameters(),
                request.getRecurrenceMinutes()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(task);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/assign")
    @Operation(summary = "Assign task to bot", description = "Assign a task to a bot by bot UUID")
    public ResponseEntity<Task> assignTaskToBot(@PathVariable Long id, @RequestBody AssignTaskRequest request) {
        Optional<Task> task = taskService.assignTaskToBot(id, request.getBotUuid());
        return task.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "Complete task", description = "Mark a task as completed and store results")
    public ResponseEntity<Task> completeTask(@PathVariable Long id, @RequestBody CompleteTaskRequest request) {
        Optional<Task> task = taskService.completeTask(
            id,
            request.isSuccess(),
            request.getResult(),
            request.getErrorMessage(),
            request.getExecutionTimeMs()
        );
        return task.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete task", description = "Delete a task (Admin only)")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        Optional<Task> task = taskService.getTaskById(id);
        if (task.isPresent()) {
            taskService.deleteTask(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Request DTOs
    public static class CreateTaskRequest {
        private Task.TaskType type;
        private Long universeId;
        private String playerName;
        private String parameters;
        private Integer recurrenceMinutes;

        // Constructors
        public CreateTaskRequest() {}

        public CreateTaskRequest(Task.TaskType type, Long universeId, String playerName, String parameters, Integer recurrenceMinutes) {
            this.type = type;
            this.universeId = universeId;
            this.playerName = playerName;
            this.parameters = parameters;
            this.recurrenceMinutes = recurrenceMinutes;
        }

        // Getters and Setters
        public Task.TaskType getType() { return type; }
        public void setType(Task.TaskType type) { this.type = type; }

        public Long getUniverseId() { return universeId; }
        public void setUniverseId(Long universeId) { this.universeId = universeId; }

        public String getPlayerName() { return playerName; }
        public void setPlayerName(String playerName) { this.playerName = playerName; }

        public String getParameters() { return parameters; }
        public void setParameters(String parameters) { this.parameters = parameters; }

        public Integer getRecurrenceMinutes() { return recurrenceMinutes; }
        public void setRecurrenceMinutes(Integer recurrenceMinutes) { this.recurrenceMinutes = recurrenceMinutes; }
    }

    public static class AssignTaskRequest {
        private String botUuid;

        public AssignTaskRequest() {}

        public AssignTaskRequest(String botUuid) {
            this.botUuid = botUuid;
        }

        public String getBotUuid() { return botUuid; }
        public void setBotUuid(String botUuid) { this.botUuid = botUuid; }
    }

    public static class CompleteTaskRequest {
        private boolean success;
        private String result;
        private String errorMessage;
        private Long executionTimeMs;

        public CompleteTaskRequest() {}

        public CompleteTaskRequest(boolean success, String result, String errorMessage, Long executionTimeMs) {
            this.success = success;
            this.result = result;
            this.errorMessage = errorMessage;
            this.executionTimeMs = executionTimeMs;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public Long getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
    }
}
