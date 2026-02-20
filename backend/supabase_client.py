import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Anon client — for standard operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Service-role client — bypasses RLS, used for admin operations
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
