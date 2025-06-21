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
    let fileBuffer: Buffer | null = null;

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
      console.error('📄 Text extraction error for file:', fileName, extractionError);
      
      // Get buffer size for debugging if we can
      if (!fileBuffer && (fileType === 'application/pdf' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
        } catch (e) {
          // Ignore buffer creation errors
        }
      }
      
      // Log additional debugging info for mobile uploads
      console.error('📄 Debug info:', {
        fileName,
        fileType,
        fileSize,
        bufferSize: fileBuffer?.length || 0,
        userAgent: request.headers.get('user-agent'),
        isMobile: request.headers.get('user-agent')?.toLowerCase().includes('mobile')
      });
      
      const errorMessage = extractionError instanceof Error ? extractionError.message : 'Unknown extraction error';
      
      return NextResponse.json({
        success: false,
        text: '',
        message: errorMessage,
        fileName,
        fileType,
        fileSize,
        error: errorMessage,
        debugInfo: {
          bufferSize: fileBuffer?.length || 0,
          isMobile: request.headers.get('user-agent')?.toLowerCase().includes('mobile') || false
        }
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
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  console.log('📄 Starting PDF text extraction for:', file.name, 'Size:', buffer.length);
  
  // Try multiple extraction methods in order of preference
  const extractionMethods = [
    () => extractPDFWithStandardOptions(buffer),
    () => extractPDFWithMobileOptions(buffer),
    () => extractPDFWithLegacyOptions(buffer),
    () => extractPDFWithMinimalOptions(buffer),
    () => extractPDFPageByPage(buffer),
    () => extractPDFWithAdvancedFallback(buffer) // Advanced detection for scanned documents
  ];
  
  let lastError: Error | null = null;
  
  for (let i = 0; i < extractionMethods.length; i++) {
    try {
      console.log(`📄 Trying PDF extraction method ${i + 1}/${extractionMethods.length}`);
      const text = await extractionMethods[i]();
      
      if (text && text.trim().length >= 20) {
        console.log(`✅ PDF extraction successful with method ${i + 1}, length:`, text.length);
        return text;
      } else {
        console.log(`⚠️ Method ${i + 1} returned insufficient text:`, text?.length || 0);
      }
    } catch (error) {
      console.log(`❌ Method ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      lastError = error instanceof Error ? error : new Error('Unknown extraction error');
    }
  }
  
  // If all methods failed, provide helpful error message
  const errorMessage = lastError?.message || 'Unknown error';
  
  if (errorMessage.includes('Invalid PDF') || errorMessage.includes('not a PDF')) {
    throw new Error('The uploaded file is not a valid PDF document. Please check the file and try again.');
  } else if (errorMessage.includes('Encrypted') || errorMessage.includes('password')) {
    throw new Error('This PDF is password-protected. Please remove the password protection and try again.');
  } else if (buffer.length < 1000) {
    throw new Error('The uploaded file appears to be too small or corrupted. Please try a different file.');
  } else {
    throw new Error('This PDF appears to be a scanned document or image-based PDF with no extractable text. Please copy your resume text and paste it manually in the text area below.');
  }
}

async function extractPDFWithStandardOptions(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  
  const pdfData = await pdfParse(buffer, {
    max: 0 // Extract all pages
  });
  
  console.log('📄 Standard extraction result:', {
    numPages: pdfData.numpages,
    textLength: pdfData.text?.length || 0
  });
  
  return pdfData.text || '';
}

async function extractPDFWithLegacyOptions(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  
  const pdfData = await pdfParse(buffer, {
    max: 50 // Limit to first 50 pages for performance
  });
  
  console.log('📄 Legacy extraction result:', {
    numPages: pdfData.numpages,
    textLength: pdfData.text?.length || 0
  });
  
  return pdfData.text || '';
}

async function extractPDFWithMobileOptions(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  
  // Mobile PDFs often have different encoding and structure
  const pdfData = await pdfParse(buffer, {
    max: 10 // Mobile resumes are usually short
  });
  
  console.log('📄 Mobile extraction result:', {
    numPages: pdfData.numpages,
    textLength: pdfData.text?.length || 0
  });
  
  let text = pdfData.text || '';
  
  // Mobile PDFs sometimes have extra cleanup needs
  if (text) {
    text = cleanMobilePDFText(text);
  }
  
  return text;
}

async function extractPDFWithMinimalOptions(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  
  // Try with minimal options - sometimes simpler is better
  const pdfData = await pdfParse(buffer);
  
  console.log('📄 Minimal extraction result:', {
    numPages: pdfData.numpages,
    textLength: pdfData.text?.length || 0
  });
  
  return pdfData.text || '';
}

function cleanMobilePDFText(text: string): string {
  if (!text) return '';
  
  return text
    // Fix common mobile PDF encoding issues
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .replace(/\u2022/g, '•') // Fix bullet points
    .replace(/\u2013/g, '-') // Fix en-dashes
    .replace(/\u2014/g, '--') // Fix em-dashes
    .replace(/\u201C|\u201D/g, '"') // Fix smart quotes
    .replace(/\u2018|\u2019/g, "'") // Fix smart apostrophes
    // Remove weird spacing that mobile PDFs sometimes have
    .replace(/\s*\n\s*\n\s*/g, '\n\n')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase words
    // Clean up excessive whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPDFPageByPage(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  
  try {
    // Try a different approach - force text extraction with different settings
    const pdfData = await pdfParse(buffer, {
      max: 20, // Limit to first 20 pages
      // Custom render function for better text extraction
      pagerender: (pageData: any) => {
        try {
          // Simple text extraction from page data
          if (pageData && pageData.getTextContent) {
            return pageData.getTextContent().then((textContent: any) => {
              if (textContent && textContent.items) {
                return textContent.items
                  .map((item: any) => item.str || '')
                  .filter((str: string) => str.trim().length > 0)
                  .join(' ');
              }
              return '';
            }).catch(() => '');
          }
        } catch (e) {
          console.log('Custom pagerender failed, using default');
        }
        return null; // Fall back to default rendering
      }
    });
    
    console.log('📄 Enhanced extraction result:', {
      numPages: pdfData.numpages,
      textLength: pdfData.text?.length || 0
    });
    
    if (pdfData.text && pdfData.text.length > 0) {
      return pdfData.text;
    }
    
    // If still no text, try one more approach with raw extraction
    const rawData = await pdfParse(buffer, {
      max: 5 // Just first 5 pages
    });
    
    console.log('📄 Raw extraction fallback result:', rawData.text?.length || 0);
    return rawData.text || '';
    
  } catch (error) {
    console.log('Page-by-page extraction failed:', error);
    throw error;
  }
}

async function extractPDFWithAdvancedFallback(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  
  try {
    console.log('📄 Advanced fallback: Analyzing PDF structure');
    
    // First, get basic PDF info
    const pdfInfo = await pdfParse(buffer, { max: 1 });
    
    console.log('📄 PDF Analysis:', {
      pages: pdfInfo.numpages,
      info: pdfInfo.info,
      metadata: pdfInfo.metadata,
      hasText: !!pdfInfo.text && pdfInfo.text.length > 0
    });
    
    // Check if this looks like a scanned document
    const isLikelyScanned = analyzePDFForScannedContent(pdfInfo, buffer);
    
    if (isLikelyScanned) {
      throw new Error(`This appears to be a scanned document or image-based PDF (${pdfInfo.numpages} pages). These PDFs contain images of text rather than actual text content.

🔧 SOLUTIONS:
1. **Copy & Paste**: Open your original resume document and copy/paste the text into the manual input area below
2. **Re-export**: If you have the original document (Word, Google Docs), export it as a new PDF with "Text" option selected
3. **Use Manual Input**: This actually works great and gives you full control over the content

💡 TIP: Manual text input often produces better results than PDF extraction anyway!`);
    }
    
    // Try one final aggressive extraction
    console.log('📄 Attempting final aggressive extraction');
    const finalAttempt = await pdfParse(buffer, { max: 0 });
    
    if (finalAttempt.text && finalAttempt.text.trim().length > 10) {
      return finalAttempt.text;
    }
    
    throw new Error('No extractable text found in PDF despite multiple extraction attempts.');
    
  } catch (error) {
    console.log('📄 Advanced fallback failed:', error);
    throw error;
  }
}

function analyzePDFForScannedContent(pdfInfo: any, buffer: Buffer): boolean {
  // Heuristics to detect scanned documents
  const bufferSize = buffer.length;
  const pages = pdfInfo.numpages || 1;
  const avgSizePerPage = bufferSize / pages;
  
  // Large file size per page often indicates images/scans
  const hasLargeFileSize = avgSizePerPage > 500000; // 500KB per page
  
  // Check PDF metadata for scanning indicators
  const creator = pdfInfo.info?.Creator || '';
  const producer = pdfInfo.info?.Producer || '';
  
  const scanningKeywords = [
    'scan', 'scanner', 'acrobat', 'adobe scan', 'camscanner', 
    'genius scan', 'tiny scanner', 'clear scan', 'photo', 'image'
  ];
  
  const isFromScanner = scanningKeywords.some(keyword => 
    creator.toLowerCase().includes(keyword) || 
    producer.toLowerCase().includes(keyword)
  );
  
  // No text content is a strong indicator
  const hasNoText = !pdfInfo.text || pdfInfo.text.trim().length === 0;
  
  console.log('📄 Scan detection analysis:', {
    avgSizePerPage: Math.round(avgSizePerPage),
    hasLargeFileSize,
    creator,
    producer,
    isFromScanner,
    hasNoText,
    totalPages: pages
  });
  
  // Return true if multiple indicators suggest it's scanned
  return hasNoText && (hasLargeFileSize || isFromScanner || pages > 5);
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
    // Fix common encoding issues from mobile PDFs
    .replace(/\u00A0/g, ' ') // Non-breaking spaces
    .replace(/\u2022/g, '•') // Bullet points
    .replace(/\u2013/g, '-') // En-dashes
    .replace(/\u2014/g, '--') // Em-dashes
    .replace(/\u201C|\u201D/g, '"') // Smart quotes
    .replace(/\u2018|\u2019/g, "'") // Smart apostrophes
    .replace(/\u2026/g, '...') // Ellipsis
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Fix spacing issues common in mobile PDFs
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
    .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between letter and number
    .replace(/(\d)([a-zA-Z])/g, '$1 $2') // Add space between number and letter
    // Clean up whitespace
    .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple line breaks to double
    .replace(/^\s+|\s+$/gm, '') // Trim each line
    .trim();
} 