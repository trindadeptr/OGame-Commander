package com.ogame.automation.repository;

import com.ogame.automation.entity.TaskResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskResultRepository extends JpaRepository<TaskResult, Long> {
    
    @Query("SELECT tr FROM TaskResult tr WHERE tr.task.id = :taskId ORDER BY tr.createdAt DESC")
    List<TaskResult> findByTaskIdOrderByCreatedAtDesc(@Param("taskId") Long taskId);
}
