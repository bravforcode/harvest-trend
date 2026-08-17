/* Harvest Trend · รู้ทันราคา — static re-export so supabase.ts can lazily
   import a BUNDLED chunk (relative specifier) instead of a bare runtime
   import('@supabase/supabase-js') that 404s in production. */
export { createClient } from '@supabase/supabase-js';
