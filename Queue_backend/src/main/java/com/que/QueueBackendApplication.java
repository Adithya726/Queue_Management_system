package com.que;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class QueueBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(QueueBackendApplication.class, args);
		System.out.println("Project is Running...");
	}

}
