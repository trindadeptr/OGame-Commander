# Database (MariaDB)

| Param        | Value |
|--------------|-------|
| Host         | `192.168.0.10` |
| Port         | `3306` |
| Database     | `ogame` |
| User / Pass  | `ogame_user` / `example` |

```
spring.datasource.url=jdbc:mariadb://192.168.0.10:3306/ogame
```

### Core tables
| Table | Purpose |
|-------|---------|
| `user_account` | Users & roles |
| `universe`     | Universes (URL + Discord webhook) |
| `bot`          | Registered bots |
| `task`         | Task queue |
| `task_result`  | Historical results |

Schema file: `/backend/src/main/resources/schema-mariadb.sql`
