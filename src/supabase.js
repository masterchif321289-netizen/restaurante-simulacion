import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://pcemnrwodchdqoroxgyx.supabase.co";

const supabaseKey =
  "sb_publishable_FdL1a-7L5kOCSgO5kTvgwA_W9x_i9Jr";

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export default supabase;