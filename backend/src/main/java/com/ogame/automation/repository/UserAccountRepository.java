package com.ogame.automation.repository;

import com.ogame.automation.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    
    Optional<UserAccount> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    @Modifying
    @Query("UPDATE UserAccount u SET u.lastAccessAt = :accessTime WHERE u.id = :userId")
    void updateLastAccessAt(@Param("userId") Long userId, @Param("accessTime") LocalDateTime accessTime);
}
