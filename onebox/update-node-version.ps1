$netlifyContent = @'
[build]
  base = "onebox"
  command = """
    cd backend && npm install && npm run build && \
    cd ../frontend && npm install && \
    npm run build
  """
  publish = "frontend/dist"
  functions = "backend/src"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["express", "body-parser", "cors", "dotenv", "@elastic/elasticsearch", "imapflow", "winston"]

[build.environment]
  NODE_VERSION = "18.17.0"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
'@

$backendPackageContent = Get-Content "backend/package.json" | ConvertFrom-Json
$backendPackageContent.engines = @{
    node = ">=18.17.0"
    npm = ">=9.0.0"
}
$backendPackageContent | ConvertTo-Json -Depth 10 | Set-Content "backend/package.json"

$frontendPackageContent = Get-Content "frontend/package.json" | ConvertFrom-Json
$frontendPackageContent.engines = @{
    node = ">=18.17.0"
    npm = ">=9.0.0"
}
$frontendPackageContent | ConvertTo-Json -Depth 10 | Set-Content "frontend/package.json"

Set-Content "netlify.toml" $netlifyContent