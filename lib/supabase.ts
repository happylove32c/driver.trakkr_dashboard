import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hylkcbalxwdacgrfizsf.supabase.co'
const supabaseKey = 'sb_publishable_dX8313CAgOSxf1mx0VHkRA_r0du7438'

export const supabase = createClient(supabaseUrl, supabaseKey)
