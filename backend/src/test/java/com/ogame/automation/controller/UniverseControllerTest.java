package com.ogame.automation.controller;

import com.ogame.automation.entity.Universe;
import com.ogame.automation.service.UniverseService;
import com.ogame.automation.config.TestSecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UniverseController.class, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                com.ogame.automation.auth.JwtAuthenticationFilter.class,
                com.ogame.automation.auth.JwtUtil.class,
                com.ogame.automation.auth.JwtAuthenticationEntryPoint.class
        })
})
@Import(TestSecurityConfig.class)
@DisplayName("UniverseController Integration Tests")
class UniverseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UniverseService universeService;

    @Autowired
    private ObjectMapper objectMapper;

    private Universe universe;
    private UniverseService.UniverseSummary summary;
    private UniverseService.DeletionResult successResult;
    private UniverseService.DeletionResult failureResult;

    @BeforeEach
    void setUp() {
        universe = new Universe("Test Universe", "http://universe.com", "http://webhook.discord.com");
        universe.setId(1L);

        summary = new UniverseService.UniverseSummary(universe, 2, 3);
        successResult = new UniverseService.DeletionResult(true, "Universe deleted successfully");
        failureResult = new UniverseService.DeletionResult(false, "Cannot delete universe. It has 2 associated bot(s). Please delete or reassign the bots first.");
    }

    @Nested
    @DisplayName("GET Endpoints")
    class GetEndpoints {

        @Test
        @DisplayName("Should get all universes")
        @WithMockUser
        void testGetAllUniverses() throws Exception {
            // Given
            List<Universe> universes = Arrays.asList(universe);
            when(universeService.getAllUniverses()).thenReturn(universes);

            // When & Then
            mockMvc.perform(get("/api/universes"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].name").value("Test Universe"))
                    .andExpect(jsonPath("$[0].url").value("http://universe.com"));
        }

        @Test
        @DisplayName("Should get universe by ID")
        @WithMockUser
        void testGetUniverseById() throws Exception {
            // Given
            when(universeService.getUniverseById(1L)).thenReturn(Optional.of(universe));

            // When & Then
            mockMvc.perform(get("/api/universes/1"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Test Universe"));
        }

        @Test
        @DisplayName("Should return 404 for non-existent universe")
        @WithMockUser
        void testGetUniverseById_NotFound() throws Exception {
            // Given
            when(universeService.getUniverseById(999L)).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/universes/999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should get universe summary")
        @WithMockUser
        void testGetUniverseSummary() throws Exception {
            // Given
            when(universeService.getUniverseSummary(1L)).thenReturn(Optional.of(summary));

            // When & Then
            mockMvc.perform(get("/api/universes/1/summary"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.universe.id").value(1))
                    .andExpect(jsonPath("$.universe.name").value("Test Universe"))
                    .andExpect(jsonPath("$.botCount").value(2))
                    .andExpect(jsonPath("$.taskCount").value(3))
                    .andExpect(jsonPath("$.canBeDeleted").value(false));
        }
    }

    @Nested
    @DisplayName("Admin Operations")
    class AdminOperations {

        @Test
        @DisplayName("Should create universe")
        @WithMockUser(roles = "ADMIN")
        void testCreateUniverse() throws Exception {
            // Given
            when(universeService.createUniverse(any(Universe.class))).thenReturn(universe);

            // When & Then
            mockMvc.perform(post("/api/universes")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(universe)))
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Test Universe"));
        }

        @Test
        @DisplayName("Should update universe")
        @WithMockUser(roles = "ADMIN")
        void testUpdateUniverse() throws Exception {
            // Given
            Universe updatedUniverse = new Universe("Updated Universe", "http://updated.com", "http://updated-webhook.com");
            updatedUniverse.setId(1L);
            when(universeService.updateUniverse(anyLong(), any(Universe.class))).thenReturn(Optional.of(updatedUniverse));

            // When & Then
            mockMvc.perform(put("/api/universes/1")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updatedUniverse)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Updated Universe"));
        }
    }

    @Nested
    @DisplayName("Universe Deletion Protection Tests")
    class DeletionProtectionTests {

        @Test
        @DisplayName("Should successfully delete universe when no associations exist")
        @WithMockUser(roles = "ADMIN")
        void testDeleteUniverse_Success() throws Exception {
            // Given
            when(universeService.deleteUniverse(1L)).thenReturn(successResult);

            // When & Then
            mockMvc.perform(delete("/api/universes/1")
                    .with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Should prevent deletion when universe has associations")
        @WithMockUser(roles = "ADMIN")
        void testDeleteUniverse_WithAssociations() throws Exception {
            // Given
            when(universeService.deleteUniverse(1L)).thenReturn(failureResult);

            // When & Then
            mockMvc.perform(delete("/api/universes/1")
                    .with(csrf()))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.error").value("Cannot delete universe. It has 2 associated bot(s). Please delete or reassign the bots first."));
        }
    }
}
