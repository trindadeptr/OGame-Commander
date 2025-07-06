package com.ogame.automation.controller;

import com.ogame.automation.entity.Bot;
import com.ogame.automation.repository.BotRepository;
import com.ogame.automation.repository.UniverseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bots")
@Tag(name = "Bot Management", description = "Operations for managing OGame automation bots")
@SecurityRequirement(name = "bearerAuth")
public class BotController {

    @Autowired
    private BotRepository botRepository;

    @Autowired
    private UniverseRepository universeRepository;

    @GetMapping
    @Operation(summary = "Get all bots", description = "Retrieve a list of all bots with their status. All users can view.")
    public ResponseEntity<List<Bot>> getAllBots() {
        List<Bot> bots = botRepository.findAll();
        return ResponseEntity.ok(bots);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bot by ID", description = "Retrieve a specific bot by its ID")
    public ResponseEntity<Bot> getBotById(@PathVariable Long id) {
        Optional<Bot> bot = botRepository.findById(id);
        return bot.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/uuid/{uuid}")
    @Operation(summary = "Get bot by UUID", description = "Retrieve a specific bot by its UUID")
    public ResponseEntity<Bot> getBotByUuid(@PathVariable String uuid) {
        Optional<Bot> bot = botRepository.findByUuid(uuid);
        return bot.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/universe/{universeId}")
    @Operation(summary = "Get bots by universe", description = "Retrieve all bots for a specific universe")
    public ResponseEntity<List<Bot>> getBotsByUniverse(@PathVariable Long universeId) {
        if (!universeRepository.existsById(universeId)) {
            return ResponseEntity.notFound().build();
        }
        List<Bot> bots = botRepository.findByUniverseId(universeId);
        return ResponseEntity.ok(bots);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new bot", description = "Register a new bot (Admin only)")
    public ResponseEntity<Bot> createBot(@Valid @RequestBody CreateBotRequest request) {
        try {
            // Check if universe exists
            if (!universeRepository.existsById(request.getUniverseId())) {
                return ResponseEntity.badRequest().build();
            }

            // Check if UUID already exists
            if (botRepository.existsByUuid(request.getUuid())) {
                return ResponseEntity.badRequest().build();
            }

            Bot bot = new Bot();
            bot.setUuid(request.getUuid());
            bot.setName(request.getName());
            bot.setUniverse(universeRepository.findById(request.getUniverseId()).get());

            Bot savedBot = botRepository.save(bot);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedBot);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update bot", description = "Update an existing bot (Admin only)")
    public ResponseEntity<Bot> updateBot(@PathVariable Long id, @Valid @RequestBody UpdateBotRequest request) {
        Optional<Bot> optionalBot = botRepository.findById(id);
        
        if (optionalBot.isPresent()) {
            Bot bot = optionalBot.get();
            
            if (request.getName() != null) {
                bot.setName(request.getName());
            }
            
            if (request.getUniverseId() != null) {
                if (!universeRepository.existsById(request.getUniverseId())) {
                    return ResponseEntity.badRequest().build();
                }
                bot.setUniverse(universeRepository.findById(request.getUniverseId()).get());
            }
            
            Bot updatedBot = botRepository.save(bot);
            return ResponseEntity.ok(updatedBot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/heartbeat")
    @Operation(summary = "Update bot heartbeat", description = "Update the last seen timestamp for a bot")
    public ResponseEntity<Bot> updateBotHeartbeat(@PathVariable Long id) {
        Optional<Bot> optionalBot = botRepository.findById(id);
        
        if (optionalBot.isPresent()) {
            Bot bot = optionalBot.get();
            bot.updateLastSeen();
            Bot updatedBot = botRepository.save(bot);
            return ResponseEntity.ok(updatedBot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/uuid/{uuid}/heartbeat")
    @Operation(summary = "Update bot heartbeat by UUID", description = "Update the last seen timestamp for a bot using its UUID")
    public ResponseEntity<Bot> updateBotHeartbeatByUuid(@PathVariable String uuid) {
        Optional<Bot> optionalBot = botRepository.findByUuid(uuid);
        
        if (optionalBot.isPresent()) {
            Bot bot = optionalBot.get();
            bot.updateLastSeen();
            Bot updatedBot = botRepository.save(bot);
            return ResponseEntity.ok(updatedBot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete bot", description = "Delete a bot and all associated tasks (Admin only)")
    public ResponseEntity<Void> deleteBot(@PathVariable Long id) {
        if (botRepository.existsById(id)) {
            botRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Request DTOs
    public static class CreateBotRequest {
        private String uuid;
        private String name;
        private Long universeId;

        // Constructors
        public CreateBotRequest() {}

        public CreateBotRequest(String uuid, String name, Long universeId) {
            this.uuid = uuid;
            this.name = name;
            this.universeId = universeId;
        }

        // Getters and Setters
        public String getUuid() { return uuid; }
        public void setUuid(String uuid) { this.uuid = uuid; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Long getUniverseId() { return universeId; }
        public void setUniverseId(Long universeId) { this.universeId = universeId; }
    }

    public static class UpdateBotRequest {
        private String name;
        private Long universeId;

        // Constructors
        public UpdateBotRequest() {}

        public UpdateBotRequest(String name, Long universeId) {
            this.name = name;
            this.universeId = universeId;
        }

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Long getUniverseId() { return universeId; }
        public void setUniverseId(Long universeId) { this.universeId = universeId; }
    }
}
