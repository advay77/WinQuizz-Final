# PowerShell script to add role column to Supabase profiles table
# This uses the Supabase REST API with service_role key

$SUPABASE_URL = "https://usqsjbzcrdwvutccqnbm.supabase.co"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcXNqYnpjcmR3dnV0Y2NxbmJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQxMzQwNSwiZXhwIjoyMDc1OTg5NDA1fQ.kQIR2Y9RZaSYc-jx1xvlYQciotwifKQIKE91s7mWCLM"

Write-Host "🚀 Adding role column to profiles table..." -ForegroundColor Cyan

# SQL to add role column
$sql = @"
-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update existing profiles to have 'user' role
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Set admin role for specific users
UPDATE public.profiles SET role = 'admin' 
WHERE email IN ('admin.winquizz@gmail.com', 'admin@gmail.com', 'triggergmail.com');

-- Add constraint to ensure only valid roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- Create index for role column
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
"@

# Make request to Supabase REST API
$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    query = $sql
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Role column added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying changes..." -ForegroundColor Yellow
    
    # Verify by fetching profiles
    $verifyResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/profiles?select=id,email,role&limit=5" -Method Get -Headers $headers
    Write-Host "✅ Verification successful!" -ForegroundColor Green
    Write-Host "Sample profiles:" -ForegroundColor Cyan
    $verifyResponse | Format-Table -AutoSize
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://supabase.com/dashboard/project/usqsjbzcrdwvutccqnbm/sql/new" -ForegroundColor White
    Write-Host "2. Paste and run the SQL from PASTE_THIS_IN_SUPABASE.sql" -ForegroundColor White
}
