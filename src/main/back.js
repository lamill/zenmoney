'use strict'
import { BrowserWindow, shell } from 'electron'
import Axios from 'axios'
// import Axios from 'axios'

const url = require('url')
const qs = require('querystring')
const _ = require('lodash')

const redirectUri = 'http://localhost'
const apiUrl = 'api.zenmoney.ru'

export class ZenClient {
  constructor () {
    this.consumer_key = ''
    this.secret_key = ''
    this.user_id = null
    this.token = null
    this.Aerror = null
    this.rejected = true
  }

  getToken () {
    this.token = null
    this.Aerror = null
    this.Aerror = null
    this.rejected = true
    let data = this
    return new Promise(function (resolve) {
      let authWindow = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
          nodeIntegration: false
        }
      })
      authWindow.webContents.session.clearStorageData()
      authWindow.on('closed', function () {
        authWindow = null
        if (data.rejected) {
          resVal()
        }
      })

      authWindow.webContents.on('new-window', function (e, url) {
        e.preventDefault()
        shell.openExternal(url)
      })
      let resVal = (token) => {
        const retVal = {
          token: data.token,
          error: data.rejected && data.Aerror === null
            ? 'rejected'
            : data.Aerror
        }
        resolve(retVal)
      }
      authWindow.webContents.on('did-get-redirect-request', async function (e, oldUrl, newUrl) {
        if (!newUrl.startsWith(redirectUri)) {
          return
        }
        data.rejected = false
        authWindow.webContents.session.clearStorageData()
        authWindow.close()
        const hash = url.parse(newUrl).query
        const code = _.get(qs.parse(hash), 'code')
        data.user_id = _.get(qs.parse(hash), 'user_id')
        if (code === undefined) {
          data.Aerror = _.get(qs.parse(hash), 'error')
        } else {
          try {
            const params = {
              grant_type: 'authorization_code',
              client_id: data.consumer_key,
              client_secret: data.secret_key,
              code: code,
              redirect_uri: redirectUri
            }
            const resp = await Axios.post('https://' + apiUrl + '/oauth2/token/', params)
            data.token = resp.data.access_token
          } catch (error) {
            data.Aerror = error
          }
        }
        resVal()
      })

      authWindow.loadURL(url.format({
        protocol: 'https',
        host: apiUrl,
        pathname: 'oauth2/authorize',
        query: {
          redirect_uri: redirectUri,
          display: 'popup',
          response_type: 'code',
          client_id: data.consumer_key
        }
      }))
    })
  }
}
