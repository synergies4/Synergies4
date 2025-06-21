import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
          message: 'Could not extract sufficient text from the file. Please ensure the file contains readable text content.',
          fileName,
          fileType,
          fileSize
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
    // Dynamic import to avoid bundling issues
    const pdfParse = (await import('pdf-parse')).default;
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF and extract text
    const pdfData = await pdfParse(buffer);
    
    return pdfData.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file. The file may be corrupted, password-protected, or contain only images.');
  }
}

async function extractDOCXText(file: File): Promise<string> {
  try {
    // Dynamic import to avoid bundling issues
    const mammoth = await import('mammoth');
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer });
    
    return result.value || '';
  } catch (error) {
    console.error('DOCX parsing error:', error);
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