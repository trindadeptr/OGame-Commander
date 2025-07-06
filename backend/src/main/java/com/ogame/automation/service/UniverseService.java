package com.ogame.automation.service;

import com.ogame.automation.entity.Universe;
import com.ogame.automation.repository.BotRepository;
import com.ogame.automation.repository.TaskRepository;
import com.ogame.automation.repository.UniverseRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UniverseService {

    @Autowired
    private UniverseRepository universeRepository;

    @Autowired
    private BotRepository botRepository;

    @Autowired
    private TaskRepository taskRepository;

    public List<Universe> getAllUniverses() {
        return universeRepository.findAll();
    }

    public Optional<Universe> getUniverseById(Long id) {
        return universeRepository.findById(id);
    }

    public Universe createUniverse(Universe universe) {
        return universeRepository.save(universe);
    }

    public Optional<Universe> updateUniverse(Long id, Universe universeDetails) {
        Optional<Universe> optionalUniverse = universeRepository.findById(id);
        
        if (optionalUniverse.isPresent()) {
            Universe universe = optionalUniverse.get();
            universe.setName(universeDetails.getName());
            universe.setUrl(universeDetails.getUrl());
            universe.setDiscordWebhook(universeDetails.getDiscordWebhook());
            
            Universe updatedUniverse = universeRepository.save(universe);
            return Optional.of(updatedUniverse);
        }
        
        return Optional.empty();
    }

    /**
     * Safely delete a universe only if it has no associated bots or tasks
     * @param id Universe ID to delete
     * @return DeletionResult indicating success or failure with reason
     */
    public DeletionResult deleteUniverse(Long id) {
        Optional<Universe> universeOpt = universeRepository.findById(id);
        
        if (universeOpt.isEmpty()) {
            return new DeletionResult(false, "Universe not found");
        }

        // Check for associated bots
        List<com.ogame.automation.entity.Bot> associatedBots = botRepository.findByUniverseId(id);
        if (!associatedBots.isEmpty()) {
            return new DeletionResult(false, 
                String.format("Cannot delete universe. It has %d associated bot(s). Please delete or reassign the bots first.", 
                    associatedBots.size()));
        }

        // Check for associated tasks
        List<com.ogame.automation.entity.Task> associatedTasks = taskRepository.findByUniverseId(id);
        if (!associatedTasks.isEmpty()) {
            return new DeletionResult(false, 
                String.format("Cannot delete universe. It has %d associated task(s). Please delete or reassign the tasks first.", 
                    associatedTasks.size()));
        }

        // Safe to delete
        universeRepository.deleteById(id);
        return new DeletionResult(true, "Universe deleted successfully");
    }

    /**
     * Get summary information about a universe including associated bot and task counts
     * @param id Universe ID
     * @return UniverseSummary with counts of associated entities
     */
    public Optional<UniverseSummary> getUniverseSummary(Long id) {
        Optional<Universe> universeOpt = universeRepository.findById(id);
        
        if (universeOpt.isEmpty()) {
            return Optional.empty();
        }

        Universe universe = universeOpt.get();
        long botCount = botRepository.findByUniverseId(id).size();
        long taskCount = taskRepository.findByUniverseId(id).size();

        return Optional.of(new UniverseSummary(universe, botCount, taskCount));
    }

    /**
     * Result class for deletion operations
     */
    public static class DeletionResult {
        private final boolean success;
        private final String message;

        public DeletionResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }

    /**
     * Summary class for universe information including associated entity counts
     */
    public static class UniverseSummary {
        private final Universe universe;
        private final long botCount;
        private final long taskCount;

        public UniverseSummary(Universe universe, long botCount, long taskCount) {
            this.universe = universe;
            this.botCount = botCount;
            this.taskCount = taskCount;
        }

        public Universe getUniverse() {
            return universe;
        }

        public long getBotCount() {
            return botCount;
        }

        public long getTaskCount() {
            return taskCount;
        }

        @JsonProperty
        public boolean canBeDeleted() {
            return botCount == 0 && taskCount == 0;
        }
    }
}
