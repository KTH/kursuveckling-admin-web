'use strict'

const api = require('../api')
const co = require('co')
const log = require('kth-node-log')
const language = require('kth-node-web-common/lib/language')
const { safeGet } = require('safe-utils')
const { createElement } = require('inferno-create-element')
const { renderToString } = require('inferno-server')
const { StaticRouter } = require('inferno-router')
const { toJS } = require('mobx')
const browserConfig = require('../configuration').browser
const serverConfig = require('../configuration').server

let { appFactory, doAllAsyncBefore } = require('../../dist/js/server/app.js')

module.exports = {
  getCourseDevInfo: co.wrap(_getCourseDevInfo)
}

async function _getSellingTextFromKursinfoApi (courseCode) {
  try {
    const client = api.kursinfoApi.client
    const paths = api.kursinfoApi.paths
    return await client.getAsync(client.resolve(paths.getSellingTextByCourseCode.uri, { courseCode }), { useCache: true })
  } catch (error) {
    const apiError = new Error('Redigering av säljande texten är inte tillgänlig för nu, försöker senare')
    apiError.status = 503
    log.error('Error in _getSellingTextFromKursinfoApi', {error})
    throw apiError
  }
}

async function _getCourseDevInfo (req, res, next) {
  if (process.env['NODE_ENV'] === 'development') {
    delete require.cache[require.resolve('../../dist/js/server/app.js')]
    const tmp = require('../../dist/js/server/app.js')
    appFactory = tmp.appFactory
    doAllAsyncBefore = tmp.doAllAsyncBefore
  }
  const courseCode = req.params.courseCode
  const lang = language.getLanguage(res) || 'sv'

  try {
    const paths = api.kursinfoApi.paths
    const respSellDesc = await _getSellingTextFromKursinfoApi(courseCode)
    const userKthId = req.session.authUser.ugKthid
    // Render inferno app
    const context = {}
    const renderProps = createElement(StaticRouter, {
      location: req.url,
      context
    }, appFactory())
    renderProps.props.children.props.adminStore.setUser(userKthId)
    await renderProps.props.children.props.adminStore.getCourseRequirementFromKopps(courseCode, lang)
    renderProps.props.children.props.adminStore.addSellingTextAndImage(respSellDesc.body)
    renderProps.props.children.props.adminStore.addChangedByLastTime(respSellDesc.body)
    renderProps.props.children.props.adminStore.setBrowserConfig(browserConfig, paths, serverConfig.hostUrl)
    renderProps.props.children.props.adminStore.__SSR__setCookieHeader(req.headers.cookie)
    // await doAllAsyncBefore({
    //   pathname: req.originalUrl,
    //   query: (req.originalUrl === undefined || req.originalUrl.indexOf('?') === -1) ? undefined : req.originalUrl.substring(req.originalUrl.indexOf('?'), req.originalUrl.length),
    //   adminStore: renderProps.props.children.props.adminStore,
    //   routes: renderProps.props.children.props.children.props.children.props.children
    // })
    const html = renderToString(renderProps)
    res.render('course/index', {
      debug: 'debug' in req.query,
      html: html,
      initialState: JSON.stringify(hydrateStores(renderProps))
    })
  } catch (err) {
    log.error('Error in _getCourseDevInfo', { error: err })
    next(err)
  }
}

function hydrateStores (renderProps) {
  // This assumes that all stores are specified in a root element called Provider

  const props = renderProps.props.children.props
  const outp = {}
  for (let key in props) {
    if (typeof props[key].initializeStore === 'function') {
      outp[key] = encodeURIComponent(JSON.stringify(toJS(props[key], true)))
    }
  }
  console.log('hydrateStores', outp)
  return outp
}