# API Routes cURL Reference

This document provides cURL examples for all API routes in the Synergies4 application.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most routes require authentication via Bearer token. Include the token in the Authorization header:
```bash
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Auth Routes

### User Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

## Blog Routes

### Get All Blog Posts
```bash
curl -X GET "http://localhost:3000/api/blog?page=1&limit=10&category=leadership"
```

### Get Blog Post by Slug
```bash
curl -X GET http://localhost:3000/api/blog/leadership-tips
```

### Create Blog Post (Admin Only)
```bash
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Blog Post",
    "slug": "new-blog-post",
    "excerpt": "Brief description",
    "content": "Full blog content...",
    "category": "leadership",
    "tags": ["management", "tips"],
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "reading_time": 5
  }'
```

### Update Blog Post (Admin Only)
```bash
curl -X PATCH http://localhost:3000/api/blog/leadership-tips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content..."
  }'
```

### Delete Blog Post (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/blog/leadership-tips \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Blog Categories
```bash
curl -X GET http://localhost:3000/api/blog/categories
```

## Course Routes

### Get All Courses
```bash
curl -X GET "http://localhost:3000/api/courses?page=1&limit=10&category=leadership&level=beginner"
```

### Get Course by ID
```bash
curl -X GET http://localhost:3000/api/courses/course-id-123
```

### Create Course (Admin Only)
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Leadership Fundamentals",
    "description": "Learn essential leadership skills",
    "short_desc": "Essential leadership skills",
    "category": "leadership",
    "level": "beginner",
    "price": 99.99,
    "duration": "4 weeks",
    "status": "draft",
    "featured": false,
    "prerequisites": ["Basic management experience"],
    "learning_objectives": ["Understand leadership principles"],
    "target_audience": ["Managers", "Team leads"],
    "tags": ["leadership", "management"]
  }'
```

### Update Course (Admin Only)
```bash
curl -X PUT http://localhost:3000/api/courses/course-id-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Course Title",
    "description": "Updated description",
    "price": 149.99,
    "status": "published"
  }'
```

### Delete Course (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/courses/course-id-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Enroll in Course
```bash
curl -X POST http://localhost:3000/api/courses/course-id-123/enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Course Progress
```bash
curl -X GET http://localhost:3000/api/courses/course-id-123/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Course Modules
```bash
curl -X GET http://localhost:3000/api/courses/course-id-123/modules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Course Module (Admin Only)
```bash
curl -X POST http://localhost:3000/api/courses/course-id-123/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Module 1: Introduction",
    "description": "Module description",
    "order": 1,
    "contents": [
      {
        "type": "lesson",
        "title": "Lesson 1",
        "content": "Lesson content",
        "video_url": "https://example.com/video.mp4",
        "duration": 15
      }
    ]
  }'
```

### Get Module Details
```bash
curl -X GET http://localhost:3000/api/courses/course-id-123/modules/module-id-456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Module (Admin Only)
```bash
curl -X PUT http://localhost:3000/api/courses/course-id-123/modules/module-id-456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Module Title",
    "description": "Updated description",
    "order": 2
  }'
```

### Delete Module (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/courses/course-id-123/modules/module-id-456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Module Lessons
```bash
curl -X GET http://localhost:3000/api/courses/course-id-123/modules/module-id-456/lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Lesson (Admin Only)
```bash
curl -X POST http://localhost:3000/api/courses/course-id-123/modules/module-id-456/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Lesson Title",
    "content": "Lesson content",
    "video_url": "https://example.com/video.mp4",
    "duration": 15
  }'
```

### Get Lesson Details
```bash
curl -X GET http://localhost:3000/api/courses/course-id-123/modules/module-id-456/lessons/lesson-id-789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Lesson (Admin Only)
```bash
curl -X PUT http://localhost:3000/api/courses/course-id-123/modules/module-id-456/lessons/lesson-id-789 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Lesson Title",
    "content": "Updated content",
    "duration": 20
  }'
```

### Delete Lesson (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/courses/course-id-123/modules/module-id-456/lessons/lesson-id-789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Complete Lesson
```bash
curl -X POST http://localhost:3000/api/lessons/lesson-id-789/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Course Quiz
```bash
curl -X GET http://localhost:3000/api/courses/course-id-123/quiz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Submit Quiz
```bash
curl -X POST http://localhost:3000/api/courses/course-id-123/quiz/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "answers": {
      "question_1": "answer_a",
      "question_2": "answer_b"
    }
  }'
```

## User Management

### Get All Users (Admin Only)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User Coaching Sessions
```bash
curl -X GET http://localhost:3000/api/users/user-id-123/coaching_sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User Enrollments
```bash
curl -X GET http://localhost:3000/api/user/enrollments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Enrollment Management

### Get All Enrollments (Admin Only)
```bash
curl -X GET http://localhost:3000/api/enrollments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Quiz Attempts

### Get Quiz Attempts (Admin Only)
```bash
curl -X GET http://localhost:3000/api/quiz-attempts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Stripe Integration

### Create Checkout Session
```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "courseId": "course-id-123",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

### Create Subscription
```bash
curl -X POST http://localhost:3000/api/stripe/create-subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "priceId": "price_1234567890",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

### Stripe Webhooks
```bash
curl -X POST http://localhost:3000/api/stripe/webhooks \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: YOUR_STRIPE_SIGNATURE" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_1234567890",
        "metadata": {
          "courseId": "course-id-123",
          "userId": "user-id-123"
        }
      }
    }
  }'
```

### Refresh Subscription
```bash
curl -X POST http://localhost:3000/api/subscription/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Content Generation

### Generate Content
```bash
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "Write a blog post about leadership",
    "type": "blog_post",
    "tone": "professional",
    "length": "medium"
  }'
```

### Generate Image
```bash
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "A professional business meeting",
    "style": "realistic",
    "size": "1024x1024"
  }'
```

## AI Chat

### Chat with AI
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How can I improve my leadership skills?"
      }
    ],
    "provider": "anthropic"
  }'
```

## Pocket Coach

### Get Pocket Coach Response
```bash
curl -X POST http://localhost:3000/api/pocket-coach \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "I have a difficult team member",
    "context": "team_management"
  }'
```

### Get Pocket Coach History
```bash
curl -X GET http://localhost:3000/api/pocket-coach \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Meeting Management

### Start Meeting Recording
```bash
curl -X POST http://localhost:3000/api/meeting-recorder/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Team Meeting",
    "platform": "zoom",
    "participants": ["john@example.com", "jane@example.com"]
  }'
```

### Stop Meeting Recording
```bash
curl -X POST http://localhost:3000/api/meeting-recorder/stop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "recordingId": "recording-id-123"
  }'
```

### Get Active Recording
```bash
curl -X GET http://localhost:3000/api/meeting-recorder/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Recording Status
```bash
curl -X GET http://localhost:3000/api/meeting-recorder/stop \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Meeting Transcripts

### Get All Transcripts
```bash
curl -X GET http://localhost:3000/api/meeting-transcripts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Meeting Transcript
```bash
curl -X POST http://localhost:3000/api/meeting-transcripts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Team Meeting",
    "meeting_platform": "zoom",
    "meeting_url": "https://zoom.us/recording/123",
    "participants": ["john@example.com", "jane@example.com"],
    "transcript_text": "Meeting transcript content...",
    "duration_minutes": 60,
    "summary": "Meeting summary",
    "key_points": ["Point 1", "Point 2"],
    "tags": ["team", "planning"]
  }'
```

### Get Transcript by ID
```bash
curl -X GET http://localhost:3000/api/meeting-transcripts/transcript-id-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Transcript
```bash
curl -X PUT http://localhost:3000/api/meeting-transcripts/transcript-id-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Meeting Title",
    "summary": "Updated summary",
    "key_points": ["Updated point 1", "Updated point 2"]
  }'
```

### Delete Transcript
```bash
curl -X DELETE http://localhost:3000/api/meeting-transcripts/transcript-id-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Conversations

### Get All Conversations
```bash
curl -X GET http://localhost:3000/api/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Conversation
```bash
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Conversation",
    "conversation_data": {
      "messages": [
        {
          "role": "user",
          "content": "Hello"
        }
      ]
    }
  }'
```

### Get Conversation by ID
```bash
curl -X GET http://localhost:3000/api/conversations/conversation-id-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Conversation
```bash
curl -X PUT http://localhost:3000/api/conversations/conversation-id-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Conversation Title",
    "conversation_data": {
      "messages": [
        {
          "role": "user",
          "content": "Updated message"
        }
      ]
    }
  }'
```

### Delete Conversation
```bash
curl -X DELETE http://localhost:3000/api/conversations/conversation-id-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Presentations

### Get All Presentations
```bash
curl -X GET http://localhost:3000/api/presentations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Presentation
```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Presentation",
    "content": "Presentation content",
    "slides": [
      {
        "title": "Slide 1",
        "content": "Slide content"
      }
    ]
  }'
```

### Get Presentation by ID
```bash
curl -X GET http://localhost:3000/api/presentations/presentation-id-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Presentation
```bash
curl -X PUT http://localhost:3000/api/presentations/presentation-id-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Presentation Title",
    "content": "Updated content"
  }'
```

### Delete Presentation
```bash
curl -X DELETE http://localhost:3000/api/presentations/presentation-id-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Resume Customizer

### Upload Resume
```bash
curl -X POST http://localhost:3000/api/resume-customizer/upload-resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@resume.pdf"
```

### Extract Text from Resume
```bash
curl -X POST http://localhost:3000/api/resume-customizer/extract-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Resume text content..."
  }'
```

### Extract Job URL
```bash
curl -X POST http://localhost:3000/api/resume-customizer/extract-job-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobUrl": "https://example.com/job-posting"
  }'
```

### Analyze Job Fit
```bash
curl -X POST http://localhost:3000/api/resume-customizer/analyze-fit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "resumeText": "Resume content...",
    "jobDescription": "Job description content..."
  }'
```

### Tailor Resume
```bash
curl -X POST http://localhost:3000/api/resume-customizer/tailor-resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "resumeText": "Original resume content...",
    "jobDescription": "Target job description...",
    "customizations": {
      "highlightSkills": true,
      "addKeywords": true,
      "reformat": false
    }
  }'
```

### Generate Cover Letter
```bash
curl -X POST http://localhost:3000/api/resume-customizer/generate-cover-letter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "resumeText": "Resume content...",
    "jobDescription": "Job description...",
    "companyName": "Example Corp",
    "position": "Software Engineer"
  }'
```

### Generate Interview Questions
```bash
curl -X POST http://localhost:3000/api/resume-customizer/generate-interview-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "resumeText": "Resume content...",
    "jobDescription": "Job description...",
    "questionType": "technical"
  }'
```

### Get Company Intelligence
```bash
curl -X POST http://localhost:3000/api/resume-customizer/company-intelligence \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "companyName": "Example Corp"
  }'
```

### Test Auth (Resume Customizer)
```bash
curl -X GET http://localhost:3000/api/resume-customizer/test-auth \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ROI Engine

### Calculate ROI
```bash
curl -X POST http://localhost:3000/api/roi-engine/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "investment": 5000,
    "expectedReturn": 15000,
    "timeframe": 12,
    "riskFactor": 0.1,
    "additionalCosts": 1000
  }'
```

### Get ROI History
```bash
curl -X GET http://localhost:3000/api/roi-engine/calculate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Admin Routes

### Get Admin Analytics - Enrollments
```bash
curl -X GET "http://localhost:3000/api/admin/analytics/enrollments?period=30d" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Admin Courses
```bash
curl -X GET http://localhost:3000/api/admin/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Utility Routes

### Search
```bash
curl -X GET "http://localhost:3000/api/search?q=leadership&type=courses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Send Email
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "html": "<p>Email content</p>",
    "text": "Email content"
  }'
```

### Contact Form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Contact message",
    "subject": "General Inquiry"
  }'
```

### Newsletter Subscription
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com",
    "name": "John Doe"
  }'
```

### Onboarding
```bash
curl -X GET http://localhost:3000/api/onboarding \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Submit Onboarding
```bash
curl -X POST http://localhost:3000/api/onboarding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "full_name": "John Doe",
    "job_title": "Manager",
    "company": "Example Corp",
    "primary_role": "management",
    "management_level": "middle",
    "years_experience": 5,
    "team_size": 10,
    "company_size": "medium",
    "work_environment": "hybrid",
    "biggest_challenges": ["team_motivation", "time_management"],
    "primary_goals": ["improve_leadership", "increase_productivity"],
    "focus_areas": ["communication", "strategy"],
    "coaching_style": "directive",
    "communication_tone": "professional",
    "learning_style": "visual"
  }'
```

### Transcribe Audio
```bash
curl -X POST http://localhost:3000/api/transcribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "audio=@audio-file.mp3"
```

### Get Transcription Status
```bash
curl -X GET http://localhost:3000/api/transcribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Bookings
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "service": "coaching",
    "date": "2024-01-15",
    "time": "14:00",
    "message": "Booking request"
  }'
```

### Get Bookings (Admin Only)
```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Booking (Admin Only)
```bash
curl -X PUT http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "booking_id": "booking-id-123",
    "status": "confirmed",
    "admin_notes": "Confirmed booking"
  }'
```

### Recall Webhooks
```bash
curl -X POST http://localhost:3000/api/recall-webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "recording.completed",
    "data": {
      "recording_id": "recording-123",
      "url": "https://recall.ai/recording/123"
    }
  }'
```

## Test Routes

### Test Courses API
```bash
curl -X GET http://localhost:3000/api/courses/test
```

## Notes

- Replace `YOUR_JWT_TOKEN` with actual JWT token from authentication
- Replace placeholder IDs (e.g., `course-id-123`) with actual IDs
- Most routes require authentication unless specified otherwise
- Admin routes require admin role in addition to authentication
- File uploads use `-F` flag for multipart/form-data
- Query parameters are added to GET requests as needed
- Error responses typically include a `message` field with details

## Troubleshooting

### Common Issues

#### 1. Stripe "Not a valid URL" Error
If you encounter this error when creating checkout sessions, it's usually due to:

**Missing or Invalid Environment Variable:**
```bash
# Add this to your .env.local file
NEXT_PUBLIC_URL=http://localhost:3000
```

**For Production:**
```bash
NEXT_PUBLIC_URL=https://yourdomain.com
```

**Invalid Course Image URLs:**
- Ensure course images are valid URLs (starting with http:// or https://)
- The API now validates image URLs and will skip invalid ones

**Invalid Custom URLs:**
- When passing `successUrl` or `cancelUrl` parameters, ensure they are valid URLs
- URLs must include the protocol (http:// or https://)

#### 2. Authentication Errors
- Ensure you're using a valid JWT token
- Check that the token hasn't expired
- Verify the user has the required permissions (admin routes need admin role)

#### 3. File Upload Issues
- Ensure files are within size limits (25MB for audio transcription)
- Use correct file formats (WebM, MP4, WAV, MPEG, M4A for audio)
- Use `-F` flag for multipart/form-data uploads

#### 4. Environment Variables
Make sure these are set in your `.env.local` file:
```bash
# Required for Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_URL=http://localhost:3000

# Required for OpenAI
OPENAI_API_KEY=sk-...

# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
