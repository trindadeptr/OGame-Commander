package com.ogame.automation.service;

import com.ogame.automation.entity.Bot;
import com.ogame.automation.entity.Task;
import com.ogame.automation.entity.Universe;
import com.ogame.automation.repository.BotRepository;
import com.ogame.automation.repository.TaskRepository;
import com.ogame.automation.repository.UniverseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("UniverseService Tests")
class UniverseServiceTest {

    @Mock
    private UniverseRepository universeRepository;

    @Mock
    private BotRepository botRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private UniverseService universeService;

    private Universe universe;
    private Bot bot;
    private Task task;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        universe = new Universe("Test Universe", "http://universe", "http://webhook");
        universe.setId(1L);
        
        bot = new Bot();
        bot.setId(1L);
        bot.setUuid("test-bot-uuid");
        bot.setName("Test Bot");
        bot.setUniverse(universe);
        
        task = new Task();
        task.setId(1L);
        task.setType(Task.TaskType.CHECK_ACTIVITY);
        task.setUniverse(universe);
        task.setPlayerName("TestPlayer");
    }

    @Nested
    @DisplayName("Universe Deletion Tests")
    class UniverseDeletionTests {

        @Test
        @DisplayName("Should successfully delete universe with no associations")
        void testDeleteUniverse_NoAssociations() {
            // Given
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));
            when(botRepository.findByUniverseId(1L)).thenReturn(Collections.emptyList());
            when(taskRepository.findByUniverseId(1L)).thenReturn(Collections.emptyList());

            // When
            UniverseService.DeletionResult result = universeService.deleteUniverse(1L);

            // Then
            assertTrue(result.isSuccess());
            assertEquals("Universe deleted successfully", result.getMessage());
            verify(universeRepository, times(1)).deleteById(1L);
            verify(botRepository, times(1)).findByUniverseId(1L);
            verify(taskRepository, times(1)).findByUniverseId(1L);
        }

        @Test
        @DisplayName("Should prevent deletion when universe has one bot")
        void testDeleteUniverse_WithSingleBot() {
            // Given
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));
            when(botRepository.findByUniverseId(1L)).thenReturn(Collections.singletonList(bot));

            // When
            UniverseService.DeletionResult result = universeService.deleteUniverse(1L);

            // Then
            assertFalse(result.isSuccess());
            assertEquals("Cannot delete universe. It has 1 associated bot(s). Please delete or reassign the bots first.", result.getMessage());
            verify(universeRepository, never()).deleteById(1L);
            verify(taskRepository, never()).findByUniverseId(1L); // Should not check tasks if bots exist
        }

        @Test
        @DisplayName("Should prevent deletion when universe has multiple bots")
        void testDeleteUniverse_WithMultipleBots() {
            // Given
            Bot bot2 = new Bot();
            bot2.setId(2L);
            bot2.setUuid("test-bot-uuid-2");
            bot2.setUniverse(universe);
            
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));
            when(botRepository.findByUniverseId(1L)).thenReturn(Arrays.asList(bot, bot2));

            // When
            UniverseService.DeletionResult result = universeService.deleteUniverse(1L);

            // Then
            assertFalse(result.isSuccess());
            assertEquals("Cannot delete universe. It has 2 associated bot(s). Please delete or reassign the bots first.", result.getMessage());
            verify(universeRepository, never()).deleteById(1L);
        }

        @Test
        @DisplayName("Should prevent deletion when universe has one task")
        void testDeleteUniverse_WithSingleTask() {
            // Given
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));
            when(botRepository.findByUniverseId(1L)).thenReturn(Collections.emptyList());
            when(taskRepository.findByUniverseId(1L)).thenReturn(Collections.singletonList(task));

            // When
            UniverseService.DeletionResult result = universeService.deleteUniverse(1L);

            // Then
            assertFalse(result.isSuccess());
            assertEquals("Cannot delete universe. It has 1 associated task(s). Please delete or reassign the tasks first.", result.getMessage());
            verify(universeRepository, never()).deleteById(1L);
        }

        @Test
        @DisplayName("Should prevent deletion when universe has multiple tasks")
        void testDeleteUniverse_WithMultipleTasks() {
            // Given
            Task task2 = new Task();
            task2.setId(2L);
            task2.setType(Task.TaskType.SPY_PLAYER);
            task2.setUniverse(universe);
            
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));
            when(botRepository.findByUniverseId(1L)).thenReturn(Collections.emptyList());
            when(taskRepository.findByUniverseId(1L)).thenReturn(Arrays.asList(task, task2));

            // When
            UniverseService.DeletionResult result = universeService.deleteUniverse(1L);

            // Then
            assertFalse(result.isSuccess());
            assertEquals("Cannot delete universe. It has 2 associated task(s). Please delete or reassign the tasks first.", result.getMessage());
            verify(universeRepository, never()).deleteById(1L);
        }

        @Test
        @DisplayName("Should return error when universe not found")
        void testDeleteUniverse_NotFound() {
            // Given
            when(universeRepository.findById(999L)).thenReturn(Optional.empty());

            // When
            UniverseService.DeletionResult result = universeService.deleteUniverse(999L);

            // Then
            assertFalse(result.isSuccess());
            assertEquals("Universe not found", result.getMessage());
            verify(universeRepository, never()).deleteById(anyLong());
            verify(botRepository, never()).findByUniverseId(anyLong());
            verify(taskRepository, never()).findByUniverseId(anyLong());
        }
    }

    @Nested
    @DisplayName("Universe Summary Tests")
    class UniverseSummaryTests {

        @Test
        @DisplayName("Should return summary with correct counts")
        void testGetUniverseSummary_WithCounts() {
            // Given
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));
            when(botRepository.findByUniverseId(1L)).thenReturn(Arrays.asList(bot));
            when(taskRepository.findByUniverseId(1L)).thenReturn(Arrays.asList(task));

            // When
            Optional<UniverseService.UniverseSummary> result = universeService.getUniverseSummary(1L);

            // Then
            assertTrue(result.isPresent());
            UniverseService.UniverseSummary summary = result.get();
            assertEquals(universe, summary.getUniverse());
            assertEquals(1, summary.getBotCount());
            assertEquals(1, summary.getTaskCount());
            assertFalse(summary.canBeDeleted()); // Has associations
        }

        @Test
        @DisplayName("Should return summary indicating universe can be deleted")
        void testGetUniverseSummary_CanBeDeleted() {
            // Given
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));
            when(botRepository.findByUniverseId(1L)).thenReturn(Collections.emptyList());
            when(taskRepository.findByUniverseId(1L)).thenReturn(Collections.emptyList());

            // When
            Optional<UniverseService.UniverseSummary> result = universeService.getUniverseSummary(1L);

            // Then
            assertTrue(result.isPresent());
            UniverseService.UniverseSummary summary = result.get();
            assertEquals(universe, summary.getUniverse());
            assertEquals(0, summary.getBotCount());
            assertEquals(0, summary.getTaskCount());
            assertTrue(summary.canBeDeleted()); // No associations
        }

        @Test
        @DisplayName("Should return empty when universe not found")
        void testGetUniverseSummary_NotFound() {
            // Given
            when(universeRepository.findById(999L)).thenReturn(Optional.empty());

            // When
            Optional<UniverseService.UniverseSummary> result = universeService.getUniverseSummary(999L);

            // Then
            assertFalse(result.isPresent());
        }
    }

    @Nested
    @DisplayName("CRUD Operations Tests")
    class CrudOperationsTests {

        @Test
        @DisplayName("Should get all universes")
        void testGetAllUniverses() {
            // Given
            List<Universe> universes = Arrays.asList(universe);
            when(universeRepository.findAll()).thenReturn(universes);

            // When
            List<Universe> result = universeService.getAllUniverses();

            // Then
            assertEquals(universes, result);
            verify(universeRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should get universe by ID")
        void testGetUniverseById() {
            // Given
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));

            // When
            Optional<Universe> result = universeService.getUniverseById(1L);

            // Then
            assertTrue(result.isPresent());
            assertEquals(universe, result.get());
        }

        @Test
        @DisplayName("Should create universe")
        void testCreateUniverse() {
            // Given
            when(universeRepository.save(universe)).thenReturn(universe);

            // When
            Universe result = universeService.createUniverse(universe);

            // Then
            assertEquals(universe, result);
            verify(universeRepository, times(1)).save(universe);
        }

        @Test
        @DisplayName("Should update existing universe")
        void testUpdateUniverse() {
            // Given
            Universe updatedDetails = new Universe("Updated Universe", "http://updated", "http://updated-webhook");
            when(universeRepository.findById(1L)).thenReturn(Optional.of(universe));
            when(universeRepository.save(any(Universe.class))).thenReturn(universe);

            // When
            Optional<Universe> result = universeService.updateUniverse(1L, updatedDetails);

            // Then
            assertTrue(result.isPresent());
            verify(universeRepository, times(1)).save(universe);
            assertEquals("Updated Universe", universe.getName());
            assertEquals("http://updated", universe.getUrl());
            assertEquals("http://updated-webhook", universe.getDiscordWebhook());
        }

        @Test
        @DisplayName("Should return empty when updating non-existent universe")
        void testUpdateUniverse_NotFound() {
            // Given
            Universe updatedDetails = new Universe("Updated Universe", "http://updated", "http://updated-webhook");
            when(universeRepository.findById(999L)).thenReturn(Optional.empty());

            // When
            Optional<Universe> result = universeService.updateUniverse(999L, updatedDetails);

            // Then
            assertFalse(result.isPresent());
            verify(universeRepository, never()).save(any(Universe.class));
        }
    }
}
