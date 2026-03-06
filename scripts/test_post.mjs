import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkPolicies() {
    console.log("Fetching policies for 'posts' table...");

    // We can query pg_policies using RPC if we have one, or just do a raw SQL query if we had a direct connection.
    // Since we only have the rest API, let's just create a test post fetch with just the 'posts' table, no joins, using Anon key.

    const supabaseAnon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log("1. Testing Anon fetch JUST the post (no joins)");
    const { data: d1, error: e1 } = await supabaseAnon
        .from('posts')
        .select('id, caption')
        .eq('id', '6d4a06dc-a9c3-4862-b8fd-5ad5138bce0d')
        .single();
    console.log("Result 1:", d1 ? "Found" : "Not Found", e1 || "");

    console.log("\n2. Testing Anon fetch WITH profiles");
    const { data: d2, error: e2 } = await supabaseAnon
        .from('posts')
        .select('id, profiles(id, username)')
        .eq('id', '6d4a06dc-a9c3-4862-b8fd-5ad5138bce0d')
        .single();
    console.log("Result 2:", d2 ? "Found" : "Not Found", e2 || "");

    console.log("\n3. Testing Anon fetch WITH outfits");
    const { data: d3, error: e3 } = await supabaseAnon
        .from('posts')
        .select('id, outfits(id)')
        .eq('id', '6d4a06dc-a9c3-4862-b8fd-5ad5138bce0d')
        .single();
    console.log("Result 3:", d3 ? "Found" : "Not Found", e3 || "");
}

checkPolicies();
