package com.fyd.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class NotificationWebSocketController {

    /**
     * Optional: Handle incoming messages if needed in the future
     */
    @MessageMapping("/notify")
    @SendTo("/topic/notifications")
    public Map<String, Object> send(Map<String, Object> message) {
        return message;
    }
}
