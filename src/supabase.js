import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://pcemnrwodchdqoroxgyx.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZW1ucndvZGNoZHFvcm94Z3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTE3MTAsImV4cCI6MjA5NjUyNzcxMH0.eB4h3-OkXPSIop4_vrftul-VTM3jjnlFgqYHKF8HXzE";

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export default supabase;