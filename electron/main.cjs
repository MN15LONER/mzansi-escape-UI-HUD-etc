const { app, BrowserWindow, shell } = require('electron')
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

// Same map as scripts/release-server.mjs, plus .fbx and .wasm.
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.fbx': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

let server = null
let mainWindow = null

function distRoot() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'dist')
  return path.join(__dirname, '..', 'dist')
}

function createStaticServer(root) {
  const staticServer = http.createServer(async (request, response) => {
    let urlPath
    try {
      urlPath = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname)
    } catch {
      response.writeHead(400).end('Bad request')
      return
    }

    let filePath = path.resolve(root, `.${urlPath}`)
    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
      response.writeHead(403).end('Forbidden')
      return
    }

    const hasExtension = path.extname(urlPath) !== ''

    try {
      const info = await fs.promises.stat(filePath)
      if (info.isDirectory()) {
        filePath = path.join(filePath, 'index.html')
        await fs.promises.stat(filePath)
      }
    } catch {
      if (hasExtension) {
        response.writeHead(404).end('Not found')
        return
      }
      filePath = path.join(root, 'index.html')
    }

    try {
      const body = await fs.promises.readFile(filePath)
      const type = mimeTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
      response.writeHead(200, { 'Content-Type': type })
      response.end(body)
    } catch {
      response.writeHead(404).end('Not found')
    }
  })

  return new Promise((resolve, reject) => {
    staticServer.once('error', reject)
    staticServer.listen(0, '127.0.0.1', () => {
      const { port } = staticServer.address()
      resolve({ server: staticServer, port })
    })
  })
}

function closeServer() {
  if (!server) return
  const current = server
  server = null
  if (typeof current.closeAllConnections === 'function') current.closeAllConnections()
  current.close()
}

function attachNavigationGuards(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  window.webContents.on('will-navigate', (event, url) => {
    let hostname = ''
    try {
      hostname = new URL(url).hostname
    } catch {
      event.preventDefault()
      return
    }
    if (hostname !== '127.0.0.1') {
      event.preventDefault()
      if (/^https?:\/\//i.test(url)) shell.openExternal(url)
    }
  })

  window.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      window.setFullScreen(!window.isFullScreen())
      event.preventDefault()
    }
  })
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  attachNavigationGuards(mainWindow)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.loadURL(`http://127.0.0.1:${port}/`)
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.whenReady().then(async () => {
    try {
      const started = await createStaticServer(distRoot())
      server = started.server
      createWindow(started.port)
      console.log(`Mzansi Escape is running at http://127.0.0.1:${started.port}`)
    } catch (error) {
      console.error(error)
      app.quit()
    }
  })

  app.on('will-quit', closeServer)
  app.on('window-all-closed', () => {
    closeServer()
    app.quit()
  })
}
