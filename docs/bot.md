# Tampermonkey Bot

### Setup
1. Install Tampermonkey extension.
2. Import `bot-check-activity.user.js`.
3. Log‑in to OGame in Galaxy view, leave tab open.

### Task lifecycle
1. Bot fetches `CREATED` tasks → `/api/tasks?status=CREATED&universeId=X`
2. Marks task `IN_PROGRESS`.
3. Executes:
   * `CHECK_ACTIVITY` – scans planets & moons for activity icons
   * `SPY_PLAYER` – (TBD)
4. POST result → `/api/tasks/{id}/complete`
5. Fetch next task.

### Heart‑beat
Not needed; backend updates `lastSeenAt` whenever bot polls tasks.
