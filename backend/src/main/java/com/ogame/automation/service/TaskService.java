package com.ogame.automation.service;

import com.ogame.automation.entity.Bot;
import com.ogame.automation.entity.Task;
import com.ogame.automation.entity.TaskResult;
import com.ogame.automation.entity.Universe;
import com.ogame.automation.repository.BotRepository;
import com.ogame.automation.repository.TaskRepository;
import com.ogame.automation.repository.TaskResultRepository;
import com.ogame.automation.repository.UniverseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private BotRepository botRepository;

    @Autowired
    private UniverseRepository universeRepository;

    @Autowired
    private TaskResultRepository taskResultRepository;

    @Autowired
    private DiscordNotificationService discordNotificationService;

    public Page<Task> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> getTasksByStatus(Task.TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    public List<Task> getTasksByUniverse(Long universeId) {
        return taskRepository.findByUniverseId(universeId);
    }

    public List<Task> getTasksByBot(Long botId) {
        return taskRepository.findByBotId(botId);
    }

    public List<Task> getAvailableTasks(Long universeId) {
        return taskRepository.findByUniverseIdAndStatus(universeId, Task.TaskStatus.CREATED);
    }

    public List<Task> getTasksReadyForExecution() {
        LocalDateTime now = LocalDateTime.now();
        return taskRepository.findByStatusAndNextExecutionAtBefore(Task.TaskStatus.CREATED, now);
    }

    public Task createTask(Task.TaskType type, Long universeId, String playerName, String parameters, Integer recurrenceMinutes) {
        Optional<Universe> universeOpt = universeRepository.findById(universeId);
        if (universeOpt.isEmpty()) {
            throw new IllegalArgumentException("Universe not found");
        }

        Task task = new Task();
        task.setType(type);
        task.setUniverse(universeOpt.get());
        task.setPlayerName(playerName);
        task.setParameters(parameters);
        task.setRecurrenceMinutes(recurrenceMinutes);
        
        if (recurrenceMinutes != null && recurrenceMinutes > 0) {
            task.setNextExecutionAt(LocalDateTime.now().plusMinutes(recurrenceMinutes));
        }

        Task savedTask = taskRepository.save(task);
        
        // Send Discord notification for new task
        try {
            discordNotificationService.sendTaskCreatedNotification(savedTask);
        } catch (Exception e) {
            // Log error but don't fail the task creation
            System.err.println("Failed to send Discord notification for new task: " + e.getMessage());
        }
        
        return savedTask;
    }

    public Optional<Task> assignTaskToBot(Long taskId, String botUuid) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        Optional<Bot> botOpt = botRepository.findByUuid(botUuid);

        if (taskOpt.isPresent() && botOpt.isPresent()) {
            Task task = taskOpt.get();
            Bot bot = botOpt.get();
            
            if (task.getStatus() == Task.TaskStatus.CREATED) {
                task.markInProgress(bot);
                return Optional.of(taskRepository.save(task));
            }
        }

        return Optional.empty();
    }

    public Optional<Task> completeTask(Long taskId, boolean success, String result, String errorMessage, Long executionTimeMs) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);

        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            
            if (task.getStatus() == Task.TaskStatus.IN_PROGRESS) {
                // Create task result
                TaskResult taskResult = new TaskResult();
                taskResult.setTask(task);
                taskResult.setSuccess(success);
                taskResult.setFullResult(result);
                taskResult.setErrorMessage(errorMessage);
                taskResult.setExecutionTimeMs(executionTimeMs);
                taskResultRepository.save(taskResult);

                // Update task status
                if (success) {
                    task.markFinished();
                } else {
                    task.markError();
                }

                Task updatedTask = taskRepository.save(task);
                
                // Send Discord notification for completed task
                try {
                    discordNotificationService.sendTaskCompletedNotification(updatedTask, taskResult);
                } catch (Exception e) {
                    // Log error but don't fail the task completion
                    System.err.println("Failed to send Discord notification for completed task: " + e.getMessage());
                }
                
                return Optional.of(updatedTask);
            }
        }

        return Optional.empty();
    }

    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    public boolean canBotAccessTask(String botUuid, Long taskId) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        Optional<Bot> botOpt = botRepository.findByUuid(botUuid);

        if (taskOpt.isPresent() && botOpt.isPresent()) {
            Task task = taskOpt.get();
            Bot bot = botOpt.get();
            
            // Bot can access task if it's in the same universe
            return task.getUniverse().getId().equals(bot.getUniverse().getId());
        }

        return false;
    }
}
