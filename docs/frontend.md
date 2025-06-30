# Frontend (Angular)

Run locally:
```bash
cd frontend
npm install
npm start
# or: ng serve --proxy-config proxy.conf.json
```
Open `http://localhost:4200`

### Main routes
| Path | Component | Guard |
|------|-----------|-------|
| /login          | LoginComponent        | — |
| /tasks          | TaskListComponent     | AuthGuard |
| /tasks/create   | TaskCreateComponent   | AuthGuard |
| /tasks/:id      | TaskDetailComponent   | AuthGuard |
| /universes      | UniverseComponent     | AuthGuard + RoleGuard('ADMIN') |
| /users          | UserManagementComponent | AuthGuard + RoleGuard('ADMIN') |
