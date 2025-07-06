
# OGame Task Automation – Consolidated Requirements

| #         | Requirement                                                                                                                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-01** | The system must provide a **task queue** with states: `CREATED`, `IN_PROGRESS`, `FINISHED`, `ERROR`.                                                                                                              |
| **RF-02** | Task types supported in the 1st phase: `CHECK_ACTIVITY` and `SPY_PLAYER`.                                                                                                                                          |
| **RF-03** | Each task can be **recurring** — field `recurrenceMinutes`; once finished, the backend automatically schedules the next execution.                                                                                |
| **RF-04** | The **bot** (Tampermonkey) must: 1) fetch 1 `CREATED` task for its universe, 2) mark it `IN_PROGRESS`, 3) execute it, 4) send result/error and mark it `FINISHED`/`ERROR`, 5) only then fetch another task.        |
| **RF-05** | No _heartbeat_; the backend updates `lastSeenAt` whenever the bot polls.                                                                                                                                           |
| **RF-06** | Entities: `Universe`, `Bot`, `Task`, `TaskResult`, `UserAccount` (bot uses UUID).                                                                                                                                  |
| **RF-07** | **Multi-universe**: the `universe` table stores the URL and Discord webhook (mandatory).                                                                                                                           |
| **RF-08** | Optional Discord notification via webhook configured at the universe level.                                                                                                                                        |
| **RF-09** | **Backend**: Spring Boot 3 · Java 21 · MariaDB · Swagger.                                                                                                                                                          |
| **RF-10** | **Security**: JWT — `POST /api/auth/login` returns a token; roles: `ADMIN` / `USER`.                                                                                                                               |
| **RF-11** | Users: fields `updatedAt`, `lastAccessAt`, flag `disabled`; only `ADMIN` can manage universes and users.                                                                                                           |
| **RF-12** | **Frontend**: Angular 17 + Tailwind, fixed top Navbar; pages: _Login_, _Tasks_, _Bots_, _Universes_, _Users_.                                                                                                      |
| **RF-13** | UI Tasks: filters (player, bot, universe, status, type, dates), paginated table, **Add Task** button (form with _Repeat_ checkbox).                                                                               |
| **RF-14** | UI shows full detail (`fullResult` or `errorMessage`) in `/tasks/:id`.                                                                                                                                             |
| **RF-15** | UI Universes: create/edit/delete in a single component (mode **create / edit**).                                                                                                                                   |
| **RF-16** | UI Users: list, (de)activate account, change role, create user (only `ADMIN`).                                                                                                                                     |
| **RF-17** | **Swagger** accessible without authentication (`/swagger-ui.html`, `/v3/api-docs/**`).                                                                                                                              |
| **RF-18** | Code must be _production-ready_, follow best practices, and be free of security flaws.                                                                                                                             |
| **RF-19** | Docker Compose for MariaDB + backend; Dockerfile for the backend.                                                                                                                                                  |
| **RF-20** | Documentation must be delivered in multiple `.md` files to ensure maintainability.                                                                                                                                 |

