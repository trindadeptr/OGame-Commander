# OGame Automation Backend

Spring Boot backend for the OGame Task Automation System.

## Technology Stack

- **Java 21** (Temurin)
- **Spring Boot 3.2.0**
- **Spring Security** with JWT authentication
- **JPA/Hibernate** for database access
- **MariaDB** database
- **Swagger UI** for API documentation

## Database Configuration

The application connects to MariaDB with these settings:
- Host: `192.168.0.10:3306`
- Database: `ogame`
- User: `ogame_user`
- Password: `example`

## Running the Application

### Prerequisites

1. Java 21 installed
2. MariaDB running with the database schema applied
3. Database accessible at configured host

### Local Development

```bash
# Build the application
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

### Docker

```bash
# From project root directory
docker-compose up --build
```

This will start both MariaDB and the backend application.

## API Documentation

Once the application is running, you can access:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

## Authentication

### Default Admin User

The application creates a default admin user:
- Username: `admin`
- Password: `thisisjustanexamplepassword`

### Login Process

1. POST to `/api/auth/login` with credentials
2. Receive JWT token in response
3. Include token in Authorization header: `Bearer <token>`

## Main Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/auth/login` | Authenticate user | ❌ |
| GET | `/api/tasks` | List tasks (with filters) | ✅ |
| POST | `/api/tasks` | Create new task | ✅ |
| GET | `/api/tasks/{id}` | Get task details | ✅ |
| PUT | `/api/tasks/{id}/complete` | Complete task | ✅ |
| GET | `/api/bots` | List bots | ✅ |
| GET | `/api/universes` | List universes | ✅ (ADMIN) |
| POST | `/api/universes` | Create universe | ✅ (ADMIN) |
| GET | `/api/users` | List users | ✅ (ADMIN) |

## Project Structure

```
src/main/java/com/ogame/automation/
├── entity/           # JPA entities
├── repository/       # Spring Data repositories
├── service/          # Business logic
├── controller/       # REST controllers
├── auth/            # JWT authentication
└── config/          # Spring configuration
```

## Features Implemented

✅ JWT Authentication & Authorization  
✅ User management with roles (ADMIN/USER)  
✅ Multi-universe support  
✅ Task queue with status management  
✅ Bot registration and tracking  
✅ Task result storage  
✅ CORS configuration for frontend  
✅ Swagger API documentation  
✅ Docker support  

## Next Steps

The backend is now ready for:
1. Frontend integration
2. Bot (Tampermonkey) integration
3. Additional task types implementation
4. Discord webhook notifications
5. Recurring task scheduling
