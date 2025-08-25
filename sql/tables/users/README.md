# User Database Functions

This directory contains all user-related database setup for Synergies4AI.

## Files

- `schema.sql` - User table definitions, enums, and indexes
- `functions.sql` - Complete user system setup (RLS, RPC functions, triggers, etc.)

## Setup Instructions

### For New Installations

1. **Run the schema first:**
   ```sql
   -- Execute in Supabase SQL Editor
   \i sql/tables/users/schema.sql
   ```

2. **Then run the functions:**
   ```sql
   -- Execute in Supabase SQL Editor
   \i sql/tables/users/functions.sql
   ```

### For Existing Installations

If you have an existing database with user tables, just run the functions file:

```sql
-- Execute in Supabase SQL Editor
\i sql/tables/users/functions.sql
```

This will:
- ✅ Drop and recreate RLS policies (handles conflicts)
- ✅ Create RPC functions for API access
- ✅ Set up triggers and automation
- ✅ Configure permissions

## What's Included

### RLS Policies
- User data access control
- Admin privileges
- Profile management permissions

### RPC Functions
- `get_user_by_auth_id()` - Get user data by auth ID
- `get_user_profile_by_auth_id()` - Get profile data by auth ID
- `get_user_full_profile()` - Get complete user profile
- `is_admin()` - Check admin privileges
- `get_user_content_limits()` - Get subscription limits

### Triggers
- Automatic user creation on signup
- Content limits based on subscription
- Timestamp updates

### Utility Functions
- User analytics and reporting
- Profile management
- Learning progress tracking

## API Integration

The RPC functions are designed to work with the `/api/users` endpoint and bypass RLS recursion issues.

## Troubleshooting

If you encounter policy conflicts, the functions file automatically handles them by dropping and recreating policies.

For RPC function errors, ensure the functions file has been executed completely.
