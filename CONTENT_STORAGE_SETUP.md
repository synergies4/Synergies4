# User Content Storage Setup Guide

This guide explains how to set up and use the user content storage system for Synergize AI, which allows paid subscribers to store their presentations and conversation history.

## Database Setup

### 1. Apply Database Schemas

You need to apply two SQL schema files to your Supabase database:

#### Apply Stripe Schema (if not already done)
```bash
# In your Supabase SQL Editor, run:
cat sql/stripe-schema.sql
```

#### Apply User Content Schema
```bash
# In your Supabase SQL Editor, run:
cat sql/user-content-schema.sql
```

### 2. Database Tables Created

The user content storage system creates the following tables:

- **`user_presentations`** - Stores user presentations with content, metadata, and settings
- **`user_conversations`** - Stores AI conversation history with messages and context
- **`user_content_access`** - Logs user access to content for analytics
- **`user_content_settings`** - User preferences and subscription-based limits

### 3. Subscription-Based Limits

The system automatically sets content limits based on subscription plans:

| Plan | Max Presentations | Max Conversations |
|------|------------------|-------------------|
| Free/No Subscription | 5 | 10 |
| Starter | 20 | 50 |
| Professional | 50 | 200 |
| Enterprise | 100 | 500 |

## API Endpoints

### Presentations API

#### Get User Presentations
```http
GET /api/presentations?limit=10&offset=0&type=standard
```

#### Create New Presentation
```http
POST /api/presentations
Content-Type: application/json

{
  "title": "My Presentation",
  "content": {
    "slides": [
      {
        "title": "Slide 1",
        "content": "Slide content here",
        "notes": "Speaker notes"
      }
    ],
    "theme": "professional",
    "metadata": {}
  },
  "presentation_type": "standard",
  "tags": ["business", "ai"],
  "is_public": false
}
```

#### Get Specific Presentation
```http
GET /api/presentations/[id]
```

#### Update Presentation
```http
PUT /api/presentations/[id]
Content-Type: application/json

{
  "title": "Updated Title",
  "content": { /* updated content */ },
  "tags": ["updated", "tags"]
}
```

#### Delete Presentation
```http
DELETE /api/presentations/[id]
```

### Conversations API

#### Get User Conversations
```http
GET /api/conversations?limit=10&offset=0&type=general&archived=false
```

#### Create New Conversation
```http
POST /api/conversations
Content-Type: application/json

{
  "title": "AI Chat Session",
  "conversation_data": {
    "messages": [
      {
        "role": "user",
        "content": "Hello AI",
        "timestamp": "2024-01-01T12:00:00Z"
      },
      {
        "role": "assistant", 
        "content": "Hello! How can I help you?",
        "timestamp": "2024-01-01T12:00:01Z"
      }
    ],
    "context": {},
    "settings": {}
  },
  "conversation_type": "general",
  "course_id": null
}
```

#### Get Specific Conversation
```http
GET /api/conversations/[id]
```

#### Update Conversation (Add Messages)
```http
PUT /api/conversations/[id]
Content-Type: application/json

{
  "conversation_data": {
    "messages": [/* existing + new messages */]
  },
  "title": "Updated conversation title"
}
```

#### Delete Conversation
```http
DELETE /api/conversations/[id]
```

## Frontend Integration Examples

### React Hook for Presentations

```typescript
// hooks/useUserPresentations.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUserPresentations() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState(null);

  const fetchPresentations = async () => {
    try {
      const response = await fetch('/api/presentations');
      const data = await response.json();
      setPresentations(data.presentations);
      setLimits(data.limits);
    } catch (error) {
      console.error('Error fetching presentations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPresentation = async (presentationData) => {
    try {
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presentationData)
      });

      if (response.ok) {
        fetchPresentations(); // Refresh list
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error creating presentation:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  return {
    presentations,
    limits,
    loading,
    createPresentation,
    refreshPresentations: fetchPresentations
  };
}
```

### React Hook for Conversations

```typescript
// hooks/useUserConversations.ts
import { useState, useEffect } from 'react';

export function useUserConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConversation = async (conversationData) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationData)
      });

      if (response.ok) {
        fetchConversations();
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  };

  const updateConversation = async (id, updates) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchConversations();
        return await response.json();
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    loading,
    saveConversation,
    updateConversation,
    refreshConversations: fetchConversations
  };
}
```

## Usage Examples

### Saving AI Conversations

```typescript
// When user has a conversation with AI
const saveConversationToDatabase = async (messages, courseId = null) => {
  const conversationData = {
    title: `AI Chat - ${new Date().toLocaleDateString()}`,
    conversation_data: {
      messages: messages,
      context: {
        course_id: courseId,
        user_agent: navigator.userAgent,
        session_start: sessionStartTime
      }
    },
    conversation_type: courseId ? 'course-related' : 'general',
    course_id: courseId
  };

  try {
    await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversationData)
    });
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
};
```

### Creating Presentations

```typescript
// When user creates a presentation
const createPresentation = async (slides, title) => {
  const presentationData = {
    title: title,
    content: {
      slides: slides,
      theme: 'professional',
      created_with: 'ai-assistant',
      version: '1.0'
    },
    presentation_type: 'ai-generated',
    tags: ['ai', 'business'],
    is_public: false
  };

  try {
    const response = await fetch('/api/presentations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(presentationData)
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 403) {
        alert(`Presentation limit reached: ${error.message}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create presentation:', error);
  }
};
```

## Security Features

- **Row Level Security (RLS)** - Users can only access their own content
- **Subscription-based Limits** - Automatic enforcement of content limits
- **Access Logging** - All content access is logged for analytics
- **Authentication Required** - All endpoints require valid user authentication

## Subscription Integration

The system automatically:
1. Sets content limits based on user's subscription plan
2. Initializes user content settings when a subscription is created
3. Updates limits when subscription plan changes
4. Enforces limits when creating new content

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Ensure user is logged in and session is valid
   - Check that authorization headers are being sent correctly

2. **"Limit reached" error**
   - User has reached their subscription plan limits
   - Upgrade subscription or delete old content

3. **Database connection errors**
   - Verify database schema has been applied
   - Check Supabase connection and environment variables

4. **Content not saving**
   - Check browser console for JavaScript errors
   - Verify API endpoints are responding correctly
   - Check database logs in Supabase dashboard

### Database Queries for Debugging

```sql
-- Check user's current limits
SELECT 
  u.email,
  s.plan_id,
  s.status as subscription_status,
  cs.max_presentations,
  cs.max_conversations
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN user_content_settings cs ON u.id = cs.user_id
WHERE u.email = 'user@example.com';

-- Check user's current content count
SELECT 
  'presentations' as content_type,
  COUNT(*) as count
FROM user_presentations 
WHERE user_id = 'user-uuid'
UNION ALL
SELECT 
  'conversations' as content_type,
  COUNT(*) as count
FROM user_conversations 
WHERE user_id = 'user-uuid' AND is_archived = false;
``` 