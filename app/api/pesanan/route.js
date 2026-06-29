import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Membaca kunci dari .env.local secara aman di server
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
    try {
        const data = await request.json();
        
        // Insert ke tabel Supabase dari sisi server
        const { error } = await supabase.from('pesanan').insert([data]);
        
        if (error) throw error;
        
        return NextResponse.json({ message: 'Pesanan berhasil dibuat!' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}