# Authentication & JWT

### Flow
1. Client calls **POST /api/auth/login** with JSON body:
   ```json
   { "username": "admin", "password": "yourPassword" }
   ```
2. Backend validates credentials, returns:
   ```json
   { "id":1,"username":"admin","role":"ADMIN","token":"<JWT>"}
   ```
3. Frontend stores token and attaches header:  
   `Authorization: Bearer <JWT>`

### Create first admin
```sql
INSERT INTO user_account(username,password_hash,role,disabled)
VALUES ('admin',
  '$2b$10$1ddD5fz5RvbtoJtJwdkZ/.en.R4HwlgIS9AXnldz2B4LOSqGrgC76',
  'ADMIN', false);
```
Password = `thisisjustanexamplepassword`
