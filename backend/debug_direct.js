import { parse } from 'pg-connection-string';
const testUrl = "postgresql://postgres.vrfxirivxqfvtgrxutqx:Blast%23blast5686@db.vrfxirivxqfvtgrxutqx.supabase.co:5432/postgres";
try {
    const config = parse(testUrl);
    console.log('Direct URL parsed successfully');
    console.log('Host:', config.host);
} catch (e) {
    console.log('Direct URL parsing failed:', e.message);
}
