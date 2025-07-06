# Universe Deletion Protection Test

This document demonstrates how to test the new universe deletion protection feature.

## Features Implemented

1. **Safe Deletion Check**: Universes cannot be deleted if they have associated bots or tasks
2. **Clear Error Messages**: API returns descriptive error messages when deletion is prevented
3. **Universe Summary Endpoint**: New endpoint to check universe details with associated entity counts
4. **Removed Cascade Delete**: No more accidental deletion of bots and tasks when deleting a universe

## API Changes

### Updated DELETE /api/universes/{id}
- **Before**: Would delete universe and cascade delete all bots and tasks
- **After**: Only deletes universe if no bots or tasks are associated
- **Response**: Returns `400 Bad Request` with error message if deletion is prevented

### New GET /api/universes/{id}/summary
- Returns universe details plus counts of associated bots and tasks
- Includes `canBeDeleted` flag

## Testing Steps

### 1. Test Universe Summary (All Users)
```bash
# Get summary for universe ID 1
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8081/api/universes/1/summary
```

Expected response:
```json
{
  "universe": {
    "id": 1,
    "name": "Universe Name",
    "url": "https://...",
    "discordWebhook": "https://...",
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-01-01T00:00:00"
  },
  "botCount": 2,
  "taskCount": 5,
  "canBeDeleted": false
}
```

### 2. Test Protected Deletion (Admin Only)
```bash
# Try to delete a universe with associated bots/tasks
curl -X DELETE \
     -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
     http://localhost:8081/api/universes/1
```

Expected response (400 Bad Request):
```json
{
  "error": "Cannot delete universe. It has 2 associated bot(s). Please delete or reassign the bots first."
}
```

### 3. Test Successful Deletion (Admin Only)
```bash
# Delete a universe with no associations
curl -X DELETE \
     -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
     http://localhost:8081/api/universes/999
```

Expected response: `204 No Content` (if universe exists and has no associations)

## Error Messages

The system provides specific error messages:

1. **Universe not found**: "Universe not found"
2. **Has bots**: "Cannot delete universe. It has X associated bot(s). Please delete or reassign the bots first."
3. **Has tasks**: "Cannot delete universe. It has X associated task(s). Please delete or reassign the tasks first."
4. **Has both**: Multiple messages for both bots and tasks (bots are checked first)

## Database Changes

- Removed `CascadeType.ALL` from Universe entity relationships
- Universe deletion no longer automatically deletes associated bots and tasks
- Foreign key constraints will prevent orphaned data

## Security

- Only users with `ADMIN` role can delete universes
- All endpoints require proper JWT authentication
- Deletion validation prevents data integrity issues
