package com.ogame.automation.service;

import com.ogame.automation.entity.Task;
import com.ogame.automation.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ScheduledTaskService {

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Check for recurring tasks that need to be reset every minute
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    public void processRecurringTasks() {
        LocalDateTime now = LocalDateTime.now();
        List<Task> tasksToReschedule = taskRepository.findRecurringTasksToReschedule(now);
        
        for (Task task : tasksToReschedule) {
            if (task.getRecurrenceMinutes() != null && task.getRecurrenceMinutes() > 0) {
                // Reset task status and schedule next execution
                task.setStatus(Task.TaskStatus.CREATED);
                task.setBot(null);
                task.setStartedAt(null);
                task.setFinishedAt(null);
                task.setNextExecutionAt(now.plusMinutes(task.getRecurrenceMinutes()));
                
                taskRepository.save(task);
                
                System.out.println("Rescheduled recurring task ID: " + task.getId() + 
                    " for " + task.getNextExecutionAt());
            }
        }
    }

    /**
     * Clean up old task results and finished tasks (run daily)
     */
    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    public void cleanupOldTasks() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        
        // This would require additional repository methods for cleanup
        // For now, just log that cleanup should happen
        System.out.println("Task cleanup scheduled for tasks older than: " + cutoffDate);
        
        // TODO: Implement actual cleanup logic
        // - Delete old task results
        // - Archive or delete old completed tasks
        // - Keep statistics for reporting
    }

    /**
     * Check for stale tasks that have been in progress too long
     */
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void checkStaleInProgressTasks() {
        LocalDateTime staleThreshold = LocalDateTime.now().minusMinutes(30);
        
        List<Task> staleTasks = taskRepository.findByStatusAndStartedAtBefore(
            Task.TaskStatus.IN_PROGRESS, staleThreshold);
        
        for (Task task : staleTasks) {
            System.out.println("Found stale task ID: " + task.getId() + 
                " started at: " + task.getStartedAt());
            
            // Reset stale tasks back to CREATED status
            task.setStatus(Task.TaskStatus.CREATED);
            task.setBot(null);
            task.setStartedAt(null);
            
            taskRepository.save(task);
            
            System.out.println("Reset stale task ID: " + task.getId() + " back to CREATED status");
        }
    }
}
