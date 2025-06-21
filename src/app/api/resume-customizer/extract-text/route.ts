import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user (optional for this endpoint)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Note: We'll allow this endpoint to work without authentication for better UX
    // In production, you might want to add rate limiting instead

    // Get form data containing the file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileType = file.type;
    const fileSize = file.size;
    const fileName = file.name;

    console.log('📄 Processing file:', { fileName, fileType, fileSize });

    let extractedText = '';

    try {
      if (fileType === 'application/pdf') {
        // Extract text from PDF
        extractedText = await extractPDFText(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Extract text from DOCX
        extractedText = await extractDOCXText(file);
      } else if (fileType === 'text/plain') {
        // Handle plain text files
        extractedText = await file.text();
      } else {
        return NextResponse.json({ 
          error: 'Unsupported file type',
          supportedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
        }, { status: 400 });
      }

      // Clean up the extracted text
      extractedText = cleanExtractedText(extractedText);

      if (!extractedText || extractedText.length < 50) {
        return NextResponse.json({
          success: false,
          text: '',
          message: 'Could not extract sufficient text from the file. The file may be image-based or scanned. Please copy and paste your resume text manually instead.',
          fileName,
          fileType,
          fileSize,
          fallbackAdvice: 'Try copying your resume text and pasting it in the manual input field below the upload area.'
        });
      }

      return NextResponse.json({
        success: true,
        text: extractedText,
        message: 'Text extracted successfully',
        fileName,
        fileType,
        fileSize,
        textLength: extractedText.length
      });

    } catch (extractionError) {
      console.error('Text extraction error:', extractionError);
      return NextResponse.json({
        success: false,
        text: '',
        message: 'Failed to extract text from the file. The file may be corrupted or password-protected.',
        fileName,
        fileType,
        fileSize,
        error: extractionError instanceof Error ? extractionError.message : 'Unknown extraction error'
      });
    }

  } catch (error) {
    console.error('Error in file text extraction:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the file'
    }, { status: 500 });
  }
}

async function extractPDFText(file: File): Promise<string> {
  try {
    console.log('📄 Starting PDF text extraction for:', file.name);
    
    // Dynamic import to avoid bundling issues
    const pdfParse = (await import('pdf-parse')).default;
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('📄 PDF buffer size:', buffer.length);
    
    // Parse PDF and extract text with options
    const pdfData = await pdfParse(buffer, {
      // PDF parsing options
      max: 0, // Extract all pages
      version: 'v1.10.100' // Use specific version for compatibility
    });
    
    console.log('📄 PDF parsing result:', {
      numPages: pdfData.numpages,
      textLength: pdfData.text?.length || 0,
      hasText: !!pdfData.text
    });
    
    const extractedText = pdfData.text || '';
    
    // Check if we got meaningful text
    if (!extractedText || extractedText.trim().length < 20) {
      console.warn('📄 PDF text extraction yielded minimal content');
      
      // Try alternative approach - extract raw text data
      if (pdfData.text && pdfData.text.length > 0) {
        return pdfData.text;
      }
      
      throw new Error('PDF appears to contain no extractable text content. This may be a scanned document or image-based PDF.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('💥 PDF parsing error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The uploaded file is not a valid PDF document.');
      } else if (error.message.includes('Encrypted')) {
        throw new Error('This PDF is password-protected. Please upload an unprotected version.');
      } else if (error.message.includes('no extractable text')) {
        throw new Error('This PDF appears to be a scanned document with no extractable text. Please upload a text-based PDF or copy/paste your resume content manually.');
      }
    }
    
    throw new Error('Failed to extract text from PDF. The file may be corrupted, password-protected, or contain only images.');
  }
}

async function extractDOCXText(file: File): Promise<string> {
  try {
    console.log('📝 Starting DOCX text extraction for:', file.name);
    
    // Dynamic import to avoid bundling issues
    const mammoth = await import('mammoth');
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('📝 DOCX buffer size:', buffer.length);
    
    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer });
    
    console.log('📝 DOCX extraction result:', {
      textLength: result.value?.length || 0,
      hasText: !!result.value,
      messages: result.messages?.length || 0
    });
    
    const extractedText = result.value || '';
    
    // Check if we got meaningful text
    if (!extractedText || extractedText.trim().length < 20) {
      console.warn('📝 DOCX text extraction yielded minimal content');
      throw new Error('DOCX appears to contain no extractable text content.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('💥 DOCX parsing error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('not a valid zip file')) {
        throw new Error('The uploaded file is not a valid DOCX document.');
      } else if (error.message.includes('no extractable text')) {
        throw new Error('This DOCX file appears to contain no extractable text. Please try copying and pasting your content manually.');
      }
    }
    
    throw new Error('Failed to parse DOCX file. The file may be corrupted or in an unsupported format.');
  }
}

function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Remove multiple line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace
    .trim();
} 