package com.ogame.automation.repository;

import com.ogame.automation.entity.Universe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UniverseRepository extends JpaRepository<Universe, Long> {
}
