import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Email templates
const getEmailTemplate = (type: 'course_signup' | 'meeting_summary', data: any) => {
  const baseStyles = `
    <style>
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .header {
        background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .logo {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .tagline {
        font-size: 16px;
        opacity: 0.9;
      }
      .content {
        padding: 30px 20px;
        background: #ffffff;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
        color: white !important;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 20px 0;
      }
      .footer {
        background: #f8fafc;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #666;
        border-radius: 0 0 8px 8px;
      }
      .course-details {
        background: #f0f9ff;
        border-left: 4px solid #0d9488;
        padding: 20px;
        margin: 20px 0;
      }
      .meeting-summary {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
    </style>
  `;

  if (type === 'course_signup') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Course Registration Confirmation - Synergies4</title>
        ${baseStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">🚀 Synergies4</div>
            <div class="tagline">AI-Powered Professional Development</div>
          </div>
          
          <div class="content">
            <h1>Welcome to ${data.courseTitle}!</h1>
            
            <p>Hi ${data.userName},</p>
            
            <p>Thank you for registering for our course! We're excited to have you join us on this learning journey.</p>
            
            <div class="course-details">
              <h3>📚 Course Details</h3>
              <p><strong>Course:</strong> ${data.courseTitle}</p>
              <p><strong>Level:</strong> ${data.courseLevel}</p>
              <p><strong>Category:</strong> ${data.courseCategory}</p>
              ${data.courseType === 'in_person' ? `
                <p><strong>Type:</strong> In-Person Event</p>
                <p><strong>Location:</strong> ${data.location || 'TBA'}</p>
                <p><strong>Instructor:</strong> ${data.instructor || 'TBA'}</p>
                ${data.maxParticipants ? `<p><strong>Spots Remaining:</strong> ${data.spotsRemaining}</p>` : ''}
              ` : `
                <p><strong>Type:</strong> Digital Course</p>
                <p><strong>Access:</strong> Available 24/7 online</p>
              `}
              <p><strong>Duration:</strong> ${data.duration || 'Self-paced'}</p>
            </div>
            
            <p>🎯 <strong>What's Next?</strong></p>
            <ul>
              <li>You'll receive course access details shortly</li>
              <li>Check your dashboard for course materials</li>
              <li>Join our community for discussions and support</li>
              ${data.courseType === 'in_person' ? '<li>We\'ll send location and timing details closer to the event</li>' : ''}
            </ul>
            
            <div style="text-align: center;">
              <a href="${data.dashboardUrl}" class="button">Access Your Dashboard</a>
            </div>
            
            <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
            
            <p>Best regards,<br>
            The Synergies4 Team</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Synergies4. All rights reserved.</p>
            <p>AI-powered professional development for the future of work.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  if (type === 'meeting_summary') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Meeting Summary - Synergies4</title>
        ${baseStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">🚀 Synergies4</div>
            <div class="tagline">AI-Powered Meeting Intelligence</div>
          </div>
          
          <div class="content">
            <h1>📋 Meeting Summary</h1>
            
            <p>Hi ${data.recipientName},</p>
            
            <p>Here's the AI-generated summary of your recent meeting.</p>
            
            <div class="meeting-summary">
              <h3>🗓️ Meeting Details</h3>
              <p><strong>Title:</strong> ${data.meetingTitle}</p>
              <p><strong>Date:</strong> ${data.meetingDate}</p>
              <p><strong>Duration:</strong> ${data.duration}</p>
              <p><strong>Participants:</strong> ${data.participants}</p>
            </div>
            
            ${data.summary ? `
              <h3>📝 Summary</h3>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                ${data.summary.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
            
            ${data.keyPoints && data.keyPoints.length > 0 ? `
              <h3>🎯 Key Points</h3>
              <ul>
                ${data.keyPoints.map((point: string) => `<li>${point}</li>`).join('')}
              </ul>
            ` : ''}
            
            ${data.actionItems && data.actionItems.length > 0 ? `
              <h3>✅ Action Items</h3>
              <ul>
                ${data.actionItems.map((item: string) => `<li>${item}</li>`).join('')}
              </ul>
            ` : ''}
            
            ${data.decisions && data.decisions.length > 0 ? `
              <h3>🎯 Decisions Made</h3>
              <ul>
                ${data.decisions.map((decision: string) => `<li>${decision}</li>`).join('')}
              </ul>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${data.viewUrl}" class="button">View Full Meeting Details</a>
            </div>
            
            <p><small>💡 This summary was generated using AI technology. For complete accuracy, please refer to the full meeting recording or transcript.</small></p>
            
            <p>Best regards,<br>
            The Synergies4 Team</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Synergies4. All rights reserved.</p>
            <p>Transforming meetings with AI-powered insights.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  return '';
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { type, to, subject, data } = await request.json();

    if (!type || !to || !data) {
      return NextResponse.json(
        { message: 'Missing required fields: type, to, data' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const emailHtml = getEmailTemplate(type, data);
    
    // For now, we'll simulate sending the email
    // In production, you would integrate with a service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Resend
    // - NodeMailer with SMTP
    
    console.log('Email would be sent to:', to);
    console.log('Subject:', subject);
    console.log('Type:', type);
    console.log('Data:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log email activity
    await supabase
      .from('email_logs')
      .insert({
        user_id: user.id,
        email_type: type,
        recipient: to,
        subject: subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: `sim_${Date.now()}`
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Failed to send email' },
      { status: 500 }
    );
  }
}

 