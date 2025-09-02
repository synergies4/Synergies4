import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default as any;
    const data = await pdfParse(buffer);
    const text: string = (data?.text || '').trim();
    return text;
  } catch (err) {
    console.error('pdf-parse error:', err);
    return '';
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const mammoth = (await import('mammoth')).default as any;
    const result = await mammoth.extractRawText({ buffer });
    return (result?.value || '').trim();
  } catch (err) {
    console.error('mammoth error:', err);
    return '';
  }
}

async function ocrWithOcrSpace(buffer: Buffer, filetype: string): Promise<string> {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) return '';
  try {
    const base64 = buffer.toString('base64');
    const form = new URLSearchParams();
    form.append('language', 'eng');
    form.append('OCREngine', '2');
    form.append('scale', 'true');
    form.append('isTable', 'true');
    form.append('detectOrientation', 'true');
    form.append('base64Image', `data:${filetype};base64,${base64}`);

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });

    const result = await response.json();
    if (result?.IsErroredOnProcessing) {
      console.warn('OCR.space error:', result?.ErrorMessage || result?.ErrorDetails);
      return '';
    }
    const parsed = (result?.ParsedResults?.[0]?.ParsedText || '').trim();
    return parsed;
  } catch (err) {
    console.error('OCR.space request error:', err);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File | null;
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const type = (file.type || 'application/octet-stream').toLowerCase();

    let text = '';

    if (type === 'application/pdf') {
      text = await extractPdfText(buffer);
      if (!text || text.length < 40) {
        // Try OCR if available
        const ocrText = await ocrWithOcrSpace(buffer, 'application/pdf');
        if (ocrText && ocrText.length >= 20) {
          text = ocrText;
        }
      }
    } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractDocxText(buffer);
    } else if (type === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ success: false, message: 'Unsupported file type' }, { status: 400 });
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Text could not be extracted (possibly a scanned document).'
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error('extract-text POST error:', error);
    return NextResponse.json({ success: false, message: 'Server error extracting text' }, { status: 500 });
  }
}