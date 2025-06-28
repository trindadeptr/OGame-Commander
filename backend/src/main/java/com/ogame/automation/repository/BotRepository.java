package com.ogame.automation.repository;

import com.ogame.automation.entity.Bot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BotRepository extends JpaRepository<Bot, Long> {
    
    Optional<Bot> findByUuid(String uuid);
    
    @Query("SELECT b FROM Bot b WHERE b.universe.id = :universeId")
    List<Bot> findByUniverseId(@Param("universeId") Long universeId);
    
    boolean existsByUuid(String uuid);
}
