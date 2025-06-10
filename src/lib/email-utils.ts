// Helper functions for sending emails

// Helper function to send course signup email
export async function sendCourseSignupEmail(courseData: any, userData: any) {
  const emailData = {
    courseTitle: courseData.title,
    courseLevel: courseData.level,
    courseCategory: courseData.category,
    courseType: courseData.course_type || 'digital',
    location: courseData.location,
    instructor: courseData.instructor_name,
    maxParticipants: courseData.max_participants,
    spotsRemaining: courseData.max_participants ? 
      courseData.max_participants - (courseData.current_participants || 0) : null,
    duration: courseData.duration,
    userName: userData.full_name || userData.email.split('@')[0],
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'course_signup',
      to: userData.email,
      subject: `Registration Confirmed: ${courseData.title}`,
      data: emailData
    }),
  });

  return response.json();
}

// Helper function to send meeting summary email
export async function sendMeetingSummaryEmail(meetingData: any, recipientEmail: string, recipientName?: string) {
  const emailData = {
    meetingTitle: meetingData.title || 'Meeting Summary',
    meetingDate: new Date(meetingData.created_at).toLocaleDateString(),
    duration: meetingData.duration || 'N/A',
    participants: meetingData.participants || 'Multiple participants',
    summary: meetingData.summary,
    keyPoints: meetingData.key_points || [],
    actionItems: meetingData.action_items || [],
    decisions: meetingData.decisions || [],
    recipientName: recipientName || recipientEmail.split('@')[0],
    viewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${meetingData.id}`
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'meeting_summary',
      to: recipientEmail,
      subject: `Meeting Summary: ${emailData.meetingTitle}`,
      data: emailData
    }),
  });

  return response.json();
} 