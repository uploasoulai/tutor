$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$deepTutorRoot = Join-Path $repoRoot 'DeepTutor'
$envFile = Join-Path $deepTutorRoot '.env'
$composeFile = Join-Path $deepTutorRoot 'compose.coastaltutor.yaml'

$appEnvFile = Join-Path $repoRoot '.env.local'
$ssoLine = Get-Content -LiteralPath $appEnvFile -ErrorAction SilentlyContinue |
  Where-Object { $_ -match '^DEEPTUTOR_HOST_SSO_SECRET=.+$' } |
  Select-Object -First 1
if (-not $ssoLine) {
  throw 'DEEPTUTOR_HOST_SSO_SECRET is missing from the local app environment.'
}

$settings = @(
  'DEEPTUTOR_HOST_SSO_ENABLED=true',
  $ssoLine
) -join "`r`n"
[IO.File]::WriteAllText($envFile, "$settings`r`n", [Text.UTF8Encoding]::new($false))

$desktopPath = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
if (-not (Test-Path -LiteralPath $desktopPath)) {
  throw 'Docker Desktop is required to run the local DeepTutor service.'
}

if (-not (Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue)) {
  Start-Process -FilePath $desktopPath -WindowStyle Hidden
}

$dockerReady = $false
for ($attempt = 0; $attempt -lt 90; $attempt += 1) {
  & docker info *> $null
  if ($LASTEXITCODE -eq 0) {
    $dockerReady = $true
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $dockerReady) {
  throw 'Docker Desktop did not become ready within three minutes.'
}

Push-Location $deepTutorRoot
try {
  & docker compose -f $composeFile up -d --build
  if ($LASTEXITCODE -ne 0) {
    throw 'DeepTutor failed to start. Check Docker Desktop and the local image build.'
  }
} finally {
  Pop-Location
}

$serviceReady = $false
for ($attempt = 0; $attempt -lt 90; $attempt += 1) {
  try {
    $response = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/health/ready' -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
      $serviceReady = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 2
    continue
  }
  Start-Sleep -Seconds 2
}

if (-not $serviceReady) {
  throw 'DeepTutor started but did not pass its readiness check within three minutes.'
}

Write-Host 'DeepTutor is ready at http://localhost:3782.'
