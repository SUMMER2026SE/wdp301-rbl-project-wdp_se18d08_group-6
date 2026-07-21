import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const originalName = (file as File).name || 'image.png';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedName}`;
    
    const bucketName = process.env.SUPABASE_ASSETS_BUCKET || 'products';

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ success: false, message: 'Supabase upload failed' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, message: 'No URL provided' }, { status: 400 });
    }

    const bucketName = process.env.SUPABASE_ASSETS_BUCKET || 'products';
    const prefix = `/storage/v1/object/public/${bucketName}/`;
    const matchIndex = url.indexOf(prefix);
    
    if (matchIndex !== -1) {
      const objectPath = url.substring(matchIndex + prefix.length);
      const { error } = await supabase.storage.from(bucketName).remove([objectPath]);
      if (error) {
        console.error('Supabase delete error:', error);
        return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: 'Invalid URL' }, { status: 400 });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
  }
}
