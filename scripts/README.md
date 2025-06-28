# Scripts Directory

This directory contains utility scripts for setting up and managing the OGame Task Automation system.

## 📋 Available Scripts

### Database Setup

#### `setup-database.sql`
Complete MariaDB database initialization script that:

- **Creates database**: `ogame` with UTF8MB4 charset
- **Creates user**: `ogame_user` with password `example`
- **Sets up schema**: All required tables with proper relationships
- **Inserts sample data**: Default admin user, universe, bot, and tasks

**Usage:**
```bash
# Run as MariaDB root user
mysql -u root -p < scripts/setup-database.sql

# Or connect and source the file
mysql -u root -p
source /path/to/ogame-automation/scripts/setup-database.sql
```

**Default Admin User:**
- Username: `admin`
- Password: `thisisjustanexamplepassword`

**Database Connection:**
- Host: `192.168.0.10:3306` (or localhost)
- Database: `ogame`
- User: `ogame_user`
- Password: `example`

## 🔧 Script Details

### Database Tables Created
1. **user_account** - System users with roles (ADMIN/USER)
2. **universe** - OGame universe configurations
3. **bot** - Bot instances linked to universes
4. **task** - Task queue with status management
5. **task_result** - Execution results and history

### Sample Data Included
- ✅ Admin user for immediate access
- ✅ Sample universe configuration
- ✅ Test bot registration
- ✅ Example tasks for testing

## 🚨 Important Notes

### Production Deployment
⚠️ **Before running in production:**

1. **Change default passwords**:
   ```sql
   -- Update ogame_user password
   ALTER USER 'ogame_user'@'%' IDENTIFIED BY 'your-secure-password';
   
   -- Update admin user password
   UPDATE user_account SET password_hash = '$2a$10$your-bcrypt-hash' WHERE username = 'admin';
   ```

2. **Update Discord webhook URL** in the universe table

3. **Review security settings** for your MariaDB instance

### Development vs Production
- **Development**: Script includes `DROP TABLE` statements for clean setup
- **Production**: Remove or comment out `DROP TABLE` statements to preserve data

## 📝 Future Scripts

Planned utility scripts:
- `backup-database.sh` - Database backup automation
- `migrate-schema.sql` - Database migration scripts
- `cleanup-old-results.sql` - Clean up old task results
- `setup-docker.sh` - Docker environment setup

## 📚 Related Documentation

- [Database Schema](../docs/database.md) - Detailed database documentation
- [Backend Setup](../docs/backend.md) - Backend configuration
- [Requirements](../docs/requirements.md) - Full project requirements
