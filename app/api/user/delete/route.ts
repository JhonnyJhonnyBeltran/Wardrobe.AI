import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Verify the user making the request is the one being deleted
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase env vars for deletion');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Create an admin client to bypass RLS and delete the user from Auth
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Delete the user from Auth (this cascades to profiles, posts, outfits, etc. if FKs are set up correctly)
        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (err: any) {
        console.error('Unexpected error during user deletion:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
