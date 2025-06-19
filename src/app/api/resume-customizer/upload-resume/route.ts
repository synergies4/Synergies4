import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Resume upload endpoint called');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('Auth check - User error:', userError);
    console.log('Auth check - User:', user ? { id: user.id, email: user.email } : null);
    
    if (userError || !user) {
      console.log('Authentication failed:', userError?.message || 'No user found');
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: userError?.message || 'No user found'
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload PDF, DOCX, or TXT files.' }, { status: 400 });
    }

    // Extract text content based on file type
    let extractedContent = '';
    
    if (file.type === 'text/plain') {
      // Handle plain text files
      extractedContent = await file.text();
    } else if (file.type === 'application/pdf') {
      // For PDF files, we'll use a simple approach - in production, you'd want to use pdf-parse or similar
      extractedContent = await extractTextFromPDF(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      // For DOCX files, we'll use a simple approach - in production, you'd want to use mammoth or similar
      extractedContent = await extractTextFromDOCX(file);
    }

    if (!extractedContent.trim()) {
      return NextResponse.json({ error: 'Could not extract text from the file' }, { status: 400 });
    }

    // Store the file (in production, you'd upload to cloud storage)
    const fileName = `${user.id}_${Date.now()}_${file.name}`;
    const fileUrl = `/uploads/resumes/${fileName}`; // This would be actual cloud storage URL

    // Update user onboarding with resume data
    console.log('Attempting to save resume data for user:', user.id);
    
    const { error: updateError } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: user.id,
        resume_filename: file.name,
        resume_content: extractedContent,
        resume_file_url: fileUrl,
        resume_uploaded_at: new Date().toISOString(),
        resume_file_size: file.size,
        resume_file_type: file.type,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating user profile with resume:', updateError);
      console.error('Error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      
      // Check if it's a column doesn't exist error
      if (updateError.message?.includes('column') && updateError.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Database migration required. Please run the resume storage migration.',
          details: updateError.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to save resume data',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      content: extractedContent,
      file_url: fileUrl,
      filename: file.name,
      file_size: file.size
    });

  } catch (error) {
    console.error('Error in resume upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to extract text from PDF
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // In a real implementation, you would use a PDF parsing library like pdf-parse
    // For now, we'll return a placeholder that indicates PDF parsing is needed
    const buffer = await file.arrayBuffer();
    
    // Placeholder - in production, use a proper PDF parser
    return `[PDF Content - File: ${file.name}, Size: ${file.size} bytes]\n\nPDF text extraction would be implemented here using a library like pdf-parse.\n\nThis is a placeholder for the extracted PDF content. The actual resume text would appear here after proper PDF parsing is implemented.`;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to extract text from DOCX
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // In a real implementation, you would use a DOCX parsing library like mammoth
    // For now, we'll return a placeholder that indicates DOCX parsing is needed
    const buffer = await file.arrayBuffer();
    
    // Placeholder - in production, use a proper DOCX parser
    return `[DOCX Content - File: ${file.name}, Size: ${file.size} bytes]\n\nDOCX text extraction would be implemented here using a library like mammoth.\n\nThis is a placeholder for the extracted DOCX content. The actual resume text would appear here after proper DOCX parsing is implemented.`;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX');
  }
} 