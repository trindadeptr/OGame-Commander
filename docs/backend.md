# Backend (Spring Boot)

### Tech
* Java 17 (Temurin)
* Spring Boot 3 + Spring Security JWT
* JPA / Hibernate
* MariaDB
* Swagger UI → `http://localhost:8080/swagger-ui.html`

### Key packages
```
com.ogame.automation
 ├─ entity        ← JPA entities
 ├─ repository    ← Spring Data repositories
 ├─ service       ← Business logic
 ├─ auth          ← AuthService, Jwt util, controllers
 └─ config        ← SecurityConfig / SwaggerConfig
```

### Main endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST   | /api/auth/login | Get JWT token | ❌ |
| GET    | /api/tasks      | List tasks (filterable) | ✅ |
| POST   | /api/tasks      | Create task            | ✅ |
| GET    | /api/universes  | List universes         | ✅ (ADMIN to create/update) |
| GET    | /api/bots       | List bots + status     | ✅ |
| GET    | /api/users      | List / manage users    | ✅ (ADMIN) |

Compile / run:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
