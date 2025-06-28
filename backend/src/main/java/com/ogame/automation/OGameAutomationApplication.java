package com.ogame.automation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OGameAutomationApplication {

    public static void main(String[] args) {
        SpringApplication.run(OGameAutomationApplication.class, args);
    }
}
