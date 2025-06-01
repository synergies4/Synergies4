# Synergize AI Chat Setup Guide

## Overview
Synergize is an advanced AI-powered learning companion integrated into the Synergies4 platform. It provides instant answers, personalized guidance, expert insights, file analysis, image generation, and presentation creation across multiple AI providers.

## ✨ Enhanced Features
- **Multi-Provider Support**: Switch between Anthropic Claude, OpenAI GPT, and Google Gemini
- **Real-time AI Chat**: Powered by multiple AI providers with visual differentiation
- **File Upload & Analysis**: Support for documents, images, and presentations
- **Image Generation**: Create custom images using AI (OpenAI DALL-E)
- **Professional UI**: Modern chat interface with provider-specific styling
- **Mobile Responsive**: Works seamlessly on all devices
- **Copy Messages**: Users can copy AI responses
- **Clear Chat**: Reset conversation anytime
- **Contextual Responses**: AI maintains conversation context
- **Visual Provider Differentiation**: Each AI provider has unique colors and branding

## Environment Setup

### 1. Create Environment File
Add these environment variables to your `.env` file:

```bash
# AI API Keys for Multi-Provider Support
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Database (if you have existing ones)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth (if you have existing ones)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Get API Keys

#### Anthropic Claude API
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

#### OpenAI API (Required for Image Generation)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

#### Google AI API
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Sign up or log in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## 🎨 Provider Visual Differentiation

Each AI provider has unique visual styling:

### Anthropic Claude 🧠
- **Colors**: Orange to Red gradient
- **Background**: Orange-tinted message bubbles
- **Icon**: Brain emoji
- **Specialty**: Advanced reasoning and analysis

### OpenAI GPT ⚡
- **Colors**: Green to Emerald gradient
- **Background**: Green-tinted message bubbles
- **Icon**: Lightning emoji
- **Specialty**: Creative content and image generation

### Google Gemini ✨
- **Colors**: Blue to Purple gradient
- **Background**: Blue-tinted message bubbles
- **Icon**: Sparkles emoji
- **Specialty**: Multimodal understanding and search

## 📁 File Upload Support

### Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: PNG, JPG, JPEG, GIF
- **Presentations**: (Analysis support)

### File Upload Features
- **Drag & Drop**: Easy file attachment
- **Multiple Files**: Upload several files at once
- **File Preview**: See attached files before sending
- **Size Display**: File size information
- **Remove Files**: Delete attachments before sending

## 🖼️ Image Generation

### Supported Providers
- **OpenAI DALL-E 3**: High-quality image generation
- **Google Imagen**: (Coming soon)
- **Anthropic**: (Not supported - text only)

### Image Generation Features
- **Custom Prompts**: Describe what you want to create
- **High Quality**: 1024x1024 resolution images
- **Instant Preview**: Images display directly in chat
- **Download Support**: Save generated images

## Navigation Integration

The Synergize button has been added to all pages with enhanced styling:

### Desktop Navigation
- Blue gradient button with Brain icon
- Positioned before the Contact button
- Smooth hover animations
- Provider-aware styling

### Mobile Navigation
- Full-width button in mobile menu
- Same styling as desktop version
- Responsive design

### Pages Updated
- ✅ Homepage (`/`)
- ✅ About Us (`/about-us`)
- ✅ Courses (`/courses`)
- ✅ Course Detail (`/courses/[slug]`)
- ✅ Coaching (`/coaching`)
- ✅ Consulting (`/consulting`)
- ✅ Industry Insight (`/industry-insight`)
- ✅ Blog Post (`/industry-insight/[slug]`)
- ✅ Contact (`/contact`)
- ✅ Synergize (`/synergize`)

## API Endpoints

### `/api/chat` (POST)
Enhanced chat endpoint with multi-provider support.

**Request Body:**
```json
{
  "message": "User's message",
  "provider": "anthropic|openai|google",
  "history": [
    {
      "id": "message_id",
      "role": "user|assistant",
      "content": "Message content",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "provider": "anthropic|openai|google"
    }
  ],
  "attachments": [
    {
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1024000
    }
  ]
}
```

**Response:**
```json
{
  "response": "AI assistant's response",
  "provider": "anthropic|openai|google"
}
```

### `/api/generate-image` (POST)
Image generation endpoint.

**Request Body:**
```json
{
  "prompt": "A professional business presentation slide",
  "provider": "openai"
}
```

**Response:**
```json
{
  "imageUrl": "https://generated-image-url.com/image.png",
  "provider": "openai",
  "prompt": "A professional business presentation slide"
}
```

## AI Assistant Configuration

Each provider is configured with specialized system prompts for Synergies4:

### Expertise Areas:
1. Business Strategy & Leadership
2. Agile & Scrum Methodologies
3. Product Management
4. Technology & Digital Transformation
5. Professional Development
6. Team Management & Coaching
7. Document Analysis & Processing
8. Visual Content Creation
9. Presentation Development

### Enhanced Capabilities:
- **File Analysis**: Process uploaded documents and images
- **Image Generation**: Create custom visuals and diagrams
- **Presentation Creation**: Help design slides and visual aids
- **Multi-format Support**: Handle various file types
- **Provider-specific Strengths**: Leverage each AI's unique capabilities

## Usage Guide

### 1. **Access**: Click the "Synergize" button in the navigation
### 2. **Select Provider**: Choose your preferred AI provider from the dropdown
### 3. **Chat**: Type your question in the text area
### 4. **Upload Files**: Click the upload button to attach documents or images
### 5. **Generate Images**: Click the image button and describe what you want to create
### 6. **Send**: Press Enter or click the Send button
### 7. **Copy**: Click the copy icon to copy AI responses
### 8. **Clear**: Use "Clear Chat" to start fresh
### 9. **Switch Providers**: Change AI providers anytime during conversation

## Provider-Specific Features

### Anthropic Claude
- **Best for**: Complex reasoning, analysis, long-form content
- **Strengths**: Document analysis, strategic thinking, detailed explanations
- **Limitations**: No image generation

### OpenAI GPT
- **Best for**: Creative content, code generation, image creation
- **Strengths**: DALL-E integration, versatile responses, creative tasks
- **Features**: Image generation, code assistance

### Google Gemini
- **Best for**: Search integration, factual information, multimodal tasks
- **Strengths**: Real-time information, web search capabilities
- **Limitations**: Image generation not yet implemented

## Troubleshooting

### Common Issues:

1. **"AI currently unavailable with [provider]"**
   - Check if the provider's API key is set in `.env`
   - Verify the API key is valid and has sufficient credits
   - Try switching to a different provider

2. **Image generation fails**
   - Ensure OpenAI API key is configured
   - Check that you have DALL-E access on your OpenAI account
   - Try switching to OpenAI provider for image generation

3. **File upload not working**
   - Check file size (should be reasonable)
   - Verify file type is supported
   - Try uploading one file at a time

4. **Provider switching issues**
   - Refresh the page if provider doesn't change
   - Check browser console for errors
   - Verify all API keys are properly configured

### Dependencies Required:
```json
{
  "@/components/ui/button": "UI Button component",
  "@/components/ui/card": "UI Card components",
  "@/components/ui/badge": "UI Badge component",
  "@/components/ui/textarea": "UI Textarea component",
  "@/components/ui/separator": "UI Separator component",
  "@/components/ui/select": "UI Select component",
  "framer-motion": "Animation library",
  "lucide-react": "Icon library"
}
```

## Security Notes

- API keys are server-side only (not exposed to client)
- File uploads are processed securely
- Rate limiting should be implemented for production
- Consider adding user authentication for chat history
- Monitor API usage and costs across all providers
- Implement file size and type restrictions

## Future Enhancements

- [ ] Chat history persistence per provider
- [ ] User-specific conversations
- [ ] Advanced file processing (OCR, document parsing)
- [ ] Voice input/output
- [ ] Slideshow generation
- [ ] Integration with course content
- [ ] Analytics and usage tracking per provider
- [ ] Google Imagen integration
- [ ] Advanced presentation templates
- [ ] Collaborative chat sessions 