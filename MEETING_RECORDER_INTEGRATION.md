# Meeting Recorder Bot Integration Guide

## Overview
This guide covers the best approaches for integrating automated meeting recording bots with Google Meet, Zoom, and other platforms.

## 🏆 Recommended Approach: Third-Party Services

### Option 1: Recall.ai (Recommended)
**Best for: Production-ready, reliable bot integration**

```typescript
// Example integration with Recall.ai
const RecallAI = {
  // Start recording a meeting
  async startRecording(meetingUrl: string, meetingPlatform: 'zoom' | 'google-meet' | 'teams') {
    const response = await fetch('https://api.recall.ai/api/v1/bot/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.RECALL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: 'Synergies4 AI Assistant',
        transcription_options: {
          provider: 'assembly_ai' // or 'deepgram', 'whisper'
        },
        chat_options: {
          send_transcription_to_chat: false
        },
        recording_options: {
          record_audio: true,
          record_video: false // Audio only for privacy
        }
      })
    });
    
    return await response.json();
  },

  // Get meeting data after completion
  async getMeetingData(botId: string) {
    const response = await fetch(`https://api.recall.ai/api/v1/bot/${botId}/`, {
      headers: {
        'Authorization': `Token ${process.env.RECALL_API_KEY}`
      }
    });
    
    return await response.json();
  }
};

// Webhook handler for Recall.ai events
export async function POST(request: NextRequest) {
  const event = await request.json();
  
  switch (event.type) {
    case 'bot.status_change':
      if (event.data.status === 'done') {
        // Meeting ended, process the recording
        await processMeetingRecording(event.data);
      }
      break;
  }
  
  return NextResponse.json({ status: 'ok' });
}

async function processMeetingRecording(botData: any) {
  // Download transcript and audio
  const transcript = await fetch(botData.transcript_url);
  const audio = await fetch(botData.audio_url);
  
  // Save to our database
  await saveMeetingTranscript({
    title: botData.meeting_metadata?.title || 'Meeting Recording',
    meeting_platform: botData.meeting_metadata?.platform,
    meeting_url: botData.meeting_url,
    transcript_text: await transcript.text(),
    recording_url: botData.audio_url,
    duration_minutes: Math.floor(botData.duration / 60),
    meeting_date: new Date(botData.started_at),
    participants: botData.participants || []
  });
}
```

**Pricing**: ~$0.10-0.20 per minute of recording
**Pros**: 
- Works with all major platforms
- High-quality transcription
- Reliable bot joining
- Real-time webhooks

### Option 2: Fireflies.ai Integration
```typescript
const FirefliesAI = {
  async createMeeting(meetingUrl: string) {
    const response = await fetch('https://api.fireflies.ai/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIREFLIES_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          mutation {
            addMeetingUrl(input: {
              url: "${meetingUrl}"
              title: "Synergies4 Meeting"
              attendeesEmails: []
            }) {
              success
              meeting {
                id
                title
              }
            }
          }
        `
      })
    });
    
    return await response.json();
  }
};
```

## 🛠️ Custom Bot Implementation

### Option 3: Custom Zoom Bot
For more control, you can build a custom bot:

```typescript
// Zoom SDK Integration
import { ZoomSDK } from '@zoomus/websdk';

class CustomZoomBot {
  private sdk: ZoomSDK;
  
  constructor() {
    this.sdk = new ZoomSDK();
  }
  
  async joinMeeting(meetingNumber: string, password?: string) {
    await this.sdk.init({
      leaveUrl: process.env.ZOOM_LEAVE_URL,
      success: () => {
        this.sdk.join({
          meetingNumber,
          password,
          userName: 'Synergies4 Bot',
          success: () => {
            this.startRecording();
          }
        });
      }
    });
  }
  
  private startRecording() {
    // Implement recording logic
    this.sdk.startRecording({
      success: () => console.log('Recording started'),
      error: (err) => console.error('Recording failed:', err)
    });
  }
}
```

### Option 4: Browser Automation with Puppeteer
```typescript
import puppeteer from 'puppeteer';

class BrowserBot {
  async joinGoogleMeet(meetingUrl: string) {
    const browser = await puppeteer.launch({
      headless: false, // For debugging
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-running-insecure-content'
      ]
    });
    
    const page = await browser.newPage();
    
    // Grant permissions
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: () => Promise.resolve(new MediaStream())
        }
      });
    });
    
    await page.goto(meetingUrl);
    
    // Click join button
    await page.waitForSelector('[data-mdc-dialog-action="join"]');
    await page.click('[data-mdc-dialog-action="join"]');
    
    // Start recording audio
    const mediaRecorder = await page.evaluate(() => {
      return new Promise((resolve) => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const recorder = new MediaRecorder(stream);
            recorder.start();
            resolve('Recording started');
          });
      });
    });
    
    return browser;
  }
}
```

## 📞 Meeting Platform APIs

### Zoom Integration
```typescript
// Using Zoom Meeting SDK
const ZoomMeetingSDK = {
  async createMeeting() {
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ZOOM_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Synergies4 Meeting',
        type: 2, // Scheduled meeting
        settings: {
          auto_recording: 'cloud',
          participant_video: false,
          host_video: false
        }
      })
    });
    
    return await response.json();
  },
  
  async getRecording(meetingId: string) {
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
      headers: {
        'Authorization': `Bearer ${process.env.ZOOM_JWT_TOKEN}`
      }
    });
    
    return await response.json();
  }
};
```

### Google Meet Integration
```typescript
// Google Calendar API to create meetings with recording
const GoogleMeetAPI = {
  async createMeeting() {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
      summary: 'Synergies4 Meeting',
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      end: {
        dateTime: new Date(Date.now() + 3600000).toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      conferenceData: {
        createRequest: {
          requestId: 'synergies4-' + Date.now(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      resource: event
    });
    
    return response.data;
  }
};
```

## 🚀 Implementation Steps

### 1. Start with Recall.ai (Recommended)
```bash
npm install @recall-ai/api-client
```

### 2. Set up webhook endpoint
```typescript
// src/app/api/meeting-webhooks/route.ts
export async function POST(request: NextRequest) {
  const event = await request.json();
  
  // Verify webhook signature
  const signature = request.headers.get('recall-signature');
  if (!verifySignature(signature, event)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Process meeting event
  await handleMeetingEvent(event);
  
  return NextResponse.json({ status: 'ok' });
}
```

### 3. Add meeting recorder UI
```typescript
// Meeting recorder component
const MeetingRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  
  const startRecording = async (meetingUrl: string) => {
    setIsRecording(true);
    
    const response = await fetch('/api/start-recording', {
      method: 'POST',
      body: JSON.stringify({ meetingUrl })
    });
    
    const { botId } = await response.json();
    // Store botId for later retrieval
  };
  
  return (
    <div>
      <Button onClick={() => startRecording(meetingUrl)}>
        {isRecording ? 'Recording...' : 'Start Recording'}
      </Button>
    </div>
  );
};
```

## 💰 Cost Comparison

| Service | Cost per Minute | Features | Pros | Cons |
|---------|----------------|----------|------|------|
| Recall.ai | $0.10-0.20 | Full automation, all platforms | Most reliable | Higher cost |
| Fireflies.ai | $0.05-0.15 | Good transcription | Easy integration | Limited customization |
| Custom Bot | Development time | Full control | Complete customization | Complex to build |
| Rev.ai | $0.02-0.05 | Just transcription | Cheapest | No bot joining |

## 🔧 Next Steps

1. **Start with Recall.ai** for proof of concept
2. **Set up webhooks** to receive meeting data
3. **Integrate with your transcript storage** system
4. **Add UI components** for meeting management
5. **Consider custom solutions** for advanced features

This approach gives you professional-grade meeting recording with minimal development effort. 