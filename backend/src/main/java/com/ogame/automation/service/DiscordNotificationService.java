package com.ogame.automation.service;

import com.ogame.automation.entity.Task;
import com.ogame.automation.entity.TaskResult;
import com.ogame.automation.entity.Universe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class DiscordNotificationService {

    private final RestTemplate restTemplate;

    public DiscordNotificationService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendTaskCompletedNotification(Task task, TaskResult result) {
        Universe universe = task.getUniverse();
        if (universe.getDiscordWebhook() == null || universe.getDiscordWebhook().isEmpty()) {
            return; // No webhook configured
        }

        String status = result.getSuccess() ? "✅ SUCCESS" : "❌ FAILED";
        String color = result.getSuccess() ? "3066993" : "15158332"; // Green or Red
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("embeds", new Object[]{
            Map.of(
                "title", "OGame Task Completed",
                "color", Integer.parseInt(color),
                "fields", new Object[]{
                    Map.of("name", "Status", "value", status, "inline", true),
                    Map.of("name", "Task Type", "value", task.getType().name(), "inline", true),
                    Map.of("name", "Universe", "value", universe.getName(), "inline", true),
                    Map.of("name", "Player", "value", task.getPlayerName() != null ? task.getPlayerName() : "N/A", "inline", true),
                    Map.of("name", "Bot", "value", task.getBot() != null ? task.getBot().getName() : "Unknown", "inline", true),
                    Map.of("name", "Execution Time", "value", result.getExecutionTimeMs() != null ? result.getExecutionTimeMs() + "ms" : "N/A", "inline", true)
                },
                "timestamp", result.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            )
        });

        if (!result.getSuccess() && result.getErrorMessage() != null) {
            ((Map<String, Object>) ((Object[]) payload.get("embeds"))[0]).put("description", 
                "**Error:** " + result.getErrorMessage());
        }

        sendWebhook(universe.getDiscordWebhook(), payload);
    }

    public void sendTaskCreatedNotification(Task task) {
        Universe universe = task.getUniverse();
        if (universe.getDiscordWebhook() == null || universe.getDiscordWebhook().isEmpty()) {
            return; // No webhook configured
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("embeds", new Object[]{
            Map.of(
                "title", "New OGame Task Created",
                "color", 3447003, // Blue
                "fields", new Object[]{
                    Map.of("name", "Task Type", "value", task.getType().name(), "inline", true),
                    Map.of("name", "Universe", "value", universe.getName(), "inline", true),
                    Map.of("name", "Player", "value", task.getPlayerName() != null ? task.getPlayerName() : "N/A", "inline", true),
                    Map.of("name", "Recurring", "value", task.getRecurrenceMinutes() != null ? "Every " + task.getRecurrenceMinutes() + " min" : "One-time", "inline", true)
                },
                "timestamp", task.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            )
        });

        sendWebhook(universe.getDiscordWebhook(), payload);
    }

    public void sendBotStatusNotification(String universeWebhook, String botName, String universeName, boolean isOnline) {
        if (universeWebhook == null || universeWebhook.isEmpty()) {
            return; // No webhook configured
        }

        String status = isOnline ? "🟢 ONLINE" : "🔴 OFFLINE";
        String color = isOnline ? "3066993" : "15158332"; // Green or Red
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("embeds", new Object[]{
            Map.of(
                "title", "Bot Status Update",
                "color", Integer.parseInt(color),
                "fields", new Object[]{
                    Map.of("name", "Bot", "value", botName, "inline", true),
                    Map.of("name", "Universe", "value", universeName, "inline", true),
                    Map.of("name", "Status", "value", status, "inline", true)
                },
                "timestamp", java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            )
        });

        sendWebhook(universeWebhook, payload);
    }

    private void sendWebhook(String webhookUrl, Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(webhookUrl, request, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send Discord webhook: " + e.getMessage());
            // Don't throw exception - webhook failures shouldn't break the application
        }
    }
}
