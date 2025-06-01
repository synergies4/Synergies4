import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface BookingData {
  course_id?: string;
  service_type: 'course' | 'coaching' | 'consulting';
  preferred_date: string;
  preferred_time: string;
  duration: number; // in minutes
  participants_count: number;
  location_preference: 'online' | 'on_site' | 'our_office';
  client_name: string;
  client_email: string;
  client_phone: string;
  company_name?: string;
  message?: string;
  special_requirements?: string;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json();

    // Validate required fields
    const requiredFields = [
      'service_type', 'preferred_date', 'preferred_time', 'duration',
      'participants_count', 'location_preference', 'client_name', 
      'client_email', 'client_phone'
    ];

    const missingFields = requiredFields.filter(field => !bookingData[field as keyof BookingData]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.client_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const bookingDate = new Date(`${bookingData.preferred_date}T${bookingData.preferred_time}`);
    if (bookingDate <= new Date()) {
      return NextResponse.json(
        { error: 'Booking date must be in the future' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if time slot is available
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('*')
      .eq('preferred_date', bookingData.preferred_date)
      .eq('preferred_time', bookingData.preferred_time)
      .eq('status', 'confirmed');

    if (checkError) {
      console.error('Error checking availability:', checkError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    // Check for conflicts (basic implementation)
    const isSlotTaken = existingBookings && existingBookings.length > 0;

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        ...bookingData,
        status: isSlotTaken ? 'pending' : 'confirmed',
        booking_reference: generateBookingReference(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Send confirmation email (placeholder - implement actual email service)
    try {
      await sendBookingConfirmation(booking);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        reference: booking.booking_reference,
        status: booking.status,
        service_type: booking.service_type,
        preferred_date: booking.preferred_date,
        preferred_time: booking.preferred_time,
        conflict: isSlotTaken
      }
    });

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const service_type = searchParams.get('service_type');
    const action = searchParams.get('action');

    const supabase = createServerClient();

    // Get available time slots for a specific date
    if (action === 'availability' && date) {
      const timeSlots = generateTimeSlots(date);
      
      // Get existing bookings for the date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('preferred_time, duration, status')
        .eq('preferred_date', date)
        .in('status', ['confirmed', 'pending']);

      if (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
          { error: 'Failed to fetch availability' },
          { status: 500 }
        );
      }

      // Mark unavailable slots
      const availableSlots = timeSlots.map(slot => {
        const isBooked = bookings?.some(booking => 
          isTimeSlotOverlapping(slot, booking)
        );
        return { ...slot, available: !isBooked };
      });

      return NextResponse.json({ slots: availableSlots });
    }

    // Get bookings for admin
    if (action === 'list') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (service_type) {
        query = query.eq('service_type', service_type);
      }

      const { data: bookings, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
          { error: 'Failed to fetch bookings' },
          { status: 500 }
        );
      }

      return NextResponse.json({ bookings });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update booking status
export async function PUT(request: NextRequest) {
  try {
    const { booking_id, status, admin_notes } = await request.json();

    if (!booking_id || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status,
        admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    // Send status update email
    try {
      await sendStatusUpdateEmail(booking);
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
    }

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking
    });

  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateBookingReference(): string {
  const prefix = 'SYN';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

function generateTimeSlots(date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const workingHours = {
    start: 9, // 9 AM
    end: 17,  // 5 PM
  };

  // Generate hourly slots
  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    // Full hour slots
    slots.push({
      date,
      time: `${hour.toString().padStart(2, '0')}:00`,
      available: true,
      duration: 60
    });
    
    // Half hour slots
    slots.push({
      date,
      time: `${hour.toString().padStart(2, '0')}:30`,
      available: true,
      duration: 60
    });
  }

  return slots;
}

function isTimeSlotOverlapping(slot: TimeSlot, booking: any): boolean {
  const slotStart = new Date(`${slot.date}T${slot.time}`);
  const slotEnd = new Date(slotStart.getTime() + slot.duration * 60000);
  
  const bookingStart = new Date(`${booking.preferred_date}T${booking.preferred_time}`);
  const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);

  return slotStart < bookingEnd && slotEnd > bookingStart;
}

async function sendBookingConfirmation(booking: any): Promise<void> {
  // Placeholder for email service integration
  console.log('Sending booking confirmation to:', booking.client_email);
  
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  // const emailContent = {
  //   to: booking.client_email,
  //   subject: `Booking Confirmation - ${booking.booking_reference}`,
  //   template: 'booking-confirmation',
  //   data: booking
  // };
}

async function sendStatusUpdateEmail(booking: any): Promise<void> {
  // Placeholder for email service integration
  console.log('Sending status update to:', booking.client_email);
  
  // TODO: Integrate with email service
} 