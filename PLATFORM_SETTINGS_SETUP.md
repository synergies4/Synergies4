# Platform Settings Setup Guide

## Issue
The admin settings page was failing with the error: `"could not find table public.platform_settings in the schema cache"`

## Solution
The `platform_settings` table was missing from the database. Follow these steps to create it:

### Steps to Fix

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor (left sidebar)

2. **Run the SQL Script**
   - Open the file: `sql/tables/platform_settings_schema.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor
   - Click "Run" to execute the script

3. **Verify the Table**
   - Go to "Table Editor" in Supabase
   - You should now see the `platform_settings` table
   - It will have one row with id=1 containing default settings

### What This Does

The SQL script:
- ✅ Creates the `platform_settings` table with all necessary columns
- ✅ Inserts default settings (site name, colors, features, etc.)
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Allows public read access (for site configuration)
- ✅ Restricts write access to admin users only
- ✅ Ensures only one settings row exists (id=1)
- ✅ Creates an auto-update trigger for the `updated_at` field

### After Setup

Once the table is created, the admin settings page will work correctly:
- Navigate to `/admin/settings`
- All tabs (General, Users, Payments, Email, AI, Appearance, SEO) will load
- Changes will save successfully to the database
- Settings persist across page reloads

### Settings Included

The table stores:
- **Site Info**: Name, description, URL, contact emails
- **Platform Settings**: Maintenance mode, registration, file uploads
- **Payment**: Stripe keys, payment enabled/disabled
- **Email**: SMTP configuration, email provider
- **AI**: OpenAI and Anthropic API keys
- **Theme**: Primary/secondary colors, custom CSS
- **Analytics**: Google Analytics configuration
- **SEO**: Meta title, description, keywords

### Troubleshooting

If you still see errors after running the script:
1. Check that the script ran successfully (no errors in SQL editor)
2. Refresh the Supabase schema cache (Database → Refresh)
3. Clear your browser cache
4. Try logging out and back in to the admin panel

### Need Help?

If you encounter any issues:
1. Check the Supabase SQL logs for error messages
2. Verify RLS policies are enabled on the table
3. Ensure your user has ADMIN role in the `users` table

