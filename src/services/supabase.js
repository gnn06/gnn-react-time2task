import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(process.env.REACT_APP_AUTH_URL, process.env.REACT_APP_API_KEY);

