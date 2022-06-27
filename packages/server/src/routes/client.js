import path from 'path'

import LiveDirectory from 'live-directory'

import { ASSETS_PATH, buildJsClient } from '../lib/build-client.js'

function processClientJsRequest (assets, minify = false) {
  /**
   *
   * @param {import('uWebSockets.js').HttpResponse} response
   * @param {import('uWebSockets.js').HttpRequest} request
   */
  return async function (response, request) {
    response.writeHeader('Access-Control-Allow-Origin', '*')

    let format = request.getQuery('format') || 'esm'

    if (!['esm', 'iife'].includes(format)) {
      format = 'esm'
    }

    const fileName = path.join(format, `client${minify ? '.min' : ''}.js`)

    const file = assets.get(fileName)

    if (file === undefined) return response.writeStatus('404').end()

    response.writeHeader('Content-Type', 'application/javascript')

    return response.end(file.buffer)
  }
}

/**
 *
 * @param {import('uWebSockets.js').TemplatedApp} app
 */
export async function client (app) {
  for (const format of ['esm', 'iife']) {
    await buildJsClient(format)
    await buildJsClient(format, true)
  }

  const assets = new LiveDirectory({
    path: ASSETS_PATH,
    keep: {
      extensions: ['.js']
    },
    ignore: (path) => {
      return path.startsWith('.')
    }
  })

  // Client js lib files
  app.get('/client.js', processClientJsRequest(assets))
  app.get('/client.min.js', processClientJsRequest(assets, true))
}
