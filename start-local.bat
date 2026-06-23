@echo off
setlocal
set "ROOT=%~dp0"
set "NODE=C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "%NODE%" (
  echo Node runtime not found.
  echo Open index.html directly instead:
  echo %ROOT%index.html
  pause
  exit /b 1
)

start "" "http://127.0.0.1:8790/"
"%NODE%" -e "const http=require('http'),fs=require('fs'),path=require('path');const root=path.resolve(process.cwd());const types={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8'};http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/'||u==='')u='/index.html';const f=path.resolve(path.join(root,u));if(!f.startsWith(root)){res.writeHead(403);return res.end('forbidden')}fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end('not found')}else{res.writeHead(200,{'content-type':types[path.extname(f)]||'text/plain;charset=utf-8'});res.end(d)}})}).listen(8790,'127.0.0.1',()=>console.log('Personal interest site: http://127.0.0.1:8790/'));"
