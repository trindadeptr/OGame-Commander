package com.ogame.automation.repository;

import com.ogame.automation.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:universeId IS NULL OR t.universe.id = :universeId) AND " +
           "(:botId IS NULL OR t.bot.id = :botId) AND " +
           "(:type IS NULL OR t.type = :type) AND " +
           "(:playerName IS NULL OR t.playerName LIKE %:playerName%) AND " +
           "(:startDate IS NULL OR t.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR t.createdAt <= :endDate)")
    Page<Task> findTasksWithFilters(@Param("status") Task.TaskStatus status,
                                   @Param("universeId") Long universeId,
                                   @Param("botId") Long botId,
                                   @Param("type") Task.TaskType type,
                                   @Param("playerName") String playerName,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate,
                                   Pageable pageable);
    
    @Query("SELECT t FROM Task t WHERE t.status = :status AND t.universe.id = :universeId ORDER BY t.createdAt ASC")
    List<Task> findAvailableTasksForUniverse(@Param("status") Task.TaskStatus status, 
                                           @Param("universeId") Long universeId);
    
    @Query("SELECT t FROM Task t WHERE t.nextExecutionAt IS NOT NULL AND t.nextExecutionAt <= :now AND t.status IN ('FINISHED', 'ERROR')")
    List<Task> findRecurringTasksToReschedule(@Param("now") LocalDateTime now);
    
    Optional<Task> findFirstByStatusAndUniverseIdOrderByCreatedAtAsc(Task.TaskStatus status, Long universeId);
}
