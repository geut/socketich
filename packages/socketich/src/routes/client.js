/** @typedef {import('uWebSockets.js').HttpResponse} HttpResponse */
/** @typedef {import('uWebSockets.js').HttpRequest} HttpRequest */
/** @typedef {import('uWebSockets.js').TemplatedApp} TemplatedApp */

import path from 'path'

import LiveDirectory from 'live-directory'

import { ASSETS_PATH } from '../config.js'

/**
 *
 * @param {LiveDirectory} assets
 * @param {Boolean} minify
 * @returns {Function}
 */
function processClientJsRequest (assets, minify = false) {
  /**
   *
   * @param {HttpResponse} response
   * @param {HttpRequest} request
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
 * @param {TemplatedApp} app
 */
export async function client (app) {
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
