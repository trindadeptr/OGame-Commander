package com.ogame.automation.controller;

import com.ogame.automation.entity.Universe;
import com.ogame.automation.service.UniverseService;
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
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/universes")
@Tag(name = "Universe Management", description = "Operations for managing OGame universes")
@SecurityRequirement(name = "bearerAuth")
public class UniverseController {

    @Autowired
    private UniverseService universeService;

    @GetMapping
    @Operation(summary = "Get all universes", description = "Retrieve a list of all universes. Admins can edit, users can only view.")
    public ResponseEntity<List<Universe>> getAllUniverses() {
        List<Universe> universes = universeService.getAllUniverses();
        return ResponseEntity.ok(universes);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get universe by ID", description = "Retrieve a specific universe by its ID")
    public ResponseEntity<Universe> getUniverseById(@PathVariable Long id) {
        Optional<Universe> universe = universeService.getUniverseById(id);
        return universe.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new universe", description = "Create a new OGame universe (Admin only)")
    public ResponseEntity<Universe> createUniverse(@Valid @RequestBody Universe universe) {
        try {
            Universe savedUniverse = universeService.createUniverse(universe);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUniverse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update universe", description = "Update an existing universe (Admin only)")
    public ResponseEntity<Universe> updateUniverse(@PathVariable Long id, @Valid @RequestBody Universe universeDetails) {
        Optional<Universe> updatedUniverse = universeService.updateUniverse(id, universeDetails);
        return updatedUniverse.map(ResponseEntity::ok)
                             .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete universe", description = "Delete a universe only if it has no associated bots or tasks (Admin only)")
    public ResponseEntity<?> deleteUniverse(@PathVariable Long id) {
        UniverseService.DeletionResult result = universeService.deleteUniverse(id);
        
        if (result.isSuccess()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", result.getMessage()));
        }
    }

    @GetMapping("/{id}/summary")
    @Operation(summary = "Get universe summary", description = "Get universe details with counts of associated bots and tasks")
    public ResponseEntity<UniverseService.UniverseSummary> getUniverseSummary(@PathVariable Long id) {
        Optional<UniverseService.UniverseSummary> summary = universeService.getUniverseSummary(id);
        return summary.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
}
