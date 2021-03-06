/**
 *
 *            Server specific settings
 *
 * *************************************************
 * * WARNING! Secrets should be read from env-vars *
 * *************************************************
 *
 */
const {
  getEnv,
  devDefaults,
  unpackLDAPConfig,
  unpackKOPPSConfig,
  unpackRedisConfig,
  unpackNodeApiConfig
} = require('kth-node-configuration')
const { typeConversion } = require('kth-node-configuration/lib/utils')
const { safeGet } = require('safe-utils')

// DEFAULT SETTINGS used for dev, if you want to override these for you local environment, use env-vars in .env
const devPort = devDefaults(3000)
const devSsl = devDefaults(false)
const devUrl = devDefaults('http://localhost:' + devPort)
const devKursutvecklingApi = devDefaults(
  'http://localhost:3001/api/kursutveckling?defaultTimeout=10000'
) // required=true&
const devKoppsApi = devDefaults(
  'https://api-r.referens.sys.kth.se/api/kopps/v2/?defaultTimeout=60000'
) // required=true&
const devKursPmDataApi = devDefaults('http://localhost:3002/api/kurs-pm-data?defaultTimeout=10000')
const devSessionKey = devDefaults('kursutveckling-web.sid')
const devSessionUseRedis = devDefaults(true)
const devRedis = devDefaults('redis://localhost:6379/')
const devLdap = undefined // Do not enter LDAP_URI or LDAP_PASSWORD here, use env_vars
const devSsoBaseURL = devDefaults('https://login-r.referens.sys.kth.se')
const devLdapBase = devDefaults('OU=UG,DC=ref,DC=ug,DC=kth,DC=se')
// END DEFAULT SETTINGS

// These options are fixed for this application
const ldapOptions = {
  base: getEnv('LDAP_BASE', devLdapBase),
  filter: '(ugKthid=KTHID)',
  filterReplaceHolder: 'KTHID',
  userattrs: ['displayName', 'mail', 'ugUsername', 'memberOf', 'ugKthid'],
  groupattrs: ['cn', 'objectCategory'],
  testSearch: true, // TODO: Should this be an ENV setting?
  timeout: typeConversion(getEnv('LDAP_TIMEOUT', null)),
  reconnectTime: typeConversion(getEnv('LDAP_IDLE_RECONNECT_INTERVAL', null)),
  reconnectOnIdle: getEnv('LDAP_IDLE_RECONNECT_INTERVAL', null) ? true : false,
  connecttimeout: typeConversion(getEnv('LDAP_CONNECT_TIMEOUT', null)),
  searchtimeout: typeConversion(getEnv('LDAP_SEARCH_TIMEOUT', null))
}

Object.keys(ldapOptions).forEach((key) => {
  if (ldapOptions[key] === null) {
    delete ldapOptions[key]
  }
})

module.exports = {
  hostUrl: getEnv('SERVER_HOST_URL', devUrl),
  useSsl: safeGet(() => getEnv('SERVER_SSL', devSsl + '').toLowerCase() === 'true'),
  port: getEnv('SERVER_PORT', devPort),
  ssl: {
    // In development we don't have SSL feature enabled
    pfx: getEnv('SERVER_CERT_FILE', ''),
    passphrase: getEnv('SERVER_CERT_PASSPHRASE', '')
  },

  // API keys
  apiKey: {
    kursutvecklingApi: getEnv('API_KEY', devDefaults('1234')),
    kursPmDataApi: getEnv('KURS_PM_DATA_API_KEY', devDefaults('1234'))
  },
  // Service API's
  nodeApi: {
    kursutvecklingApi: unpackNodeApiConfig('API_URI', devKursutvecklingApi),
    kursPmDataApi: unpackNodeApiConfig('KURS_PM_DATA_API_URI', devKursPmDataApi)
  },
  koppsApi: unpackKOPPSConfig('KOPPS_URI', devKoppsApi),

  // Authentication
  auth: {
    adminGroup: 'app.node.admin', // TODO: FIX AUTH FOR ADMIN GROUP
    responsibleGroup: 'edu.courses.SF.SF1624.20152.2.courseresponsible'
  },
  cas: {
    ssoBaseURL: getEnv('CAS_SSO_URI', devSsoBaseURL)
  },
  ldap: unpackLDAPConfig('LDAP_URI', getEnv('LDAP_PASSWORD'), devLdap, ldapOptions),

  // Cortina
  blockApi: {
    blockUrl: getEnv('CM_HOST_URL', devDefaults('https://www-r.referens.sys.kth.se/cm/')) // Block API base URL
  },

  // Logging
  logging: {
    log: {
      level: getEnv('LOGGING_LEVEL', 'debug')
    },
    accessLog: {
      useAccessLog: getEnv('LOGGING_ACCESS_LOG', true)
    }
  },
  clientLogging: {
    level: 'debug'
  },
  cache: {
    cortinaBlock: {
      redis: unpackRedisConfig('REDIS_URI', devRedis)
    },
    koppsApi: {
      redis: unpackRedisConfig('REDIS_URI', devRedis),
      expireTime: getEnv('KOPPS_API_CACHE_EXPIRE_TIME', 60 * 60) // 60 minuteS
    },
    kursutvecklingApi: {
      redis: unpackRedisConfig('REDIS_URI', devRedis),
      expireTime: getEnv('KURSUTVECKLING_API_CACHE_EXPIRE_TIME', 3 * 60) // 3 * 60 s = 3 MINUTES
    }
  },

  // Session
  sessionSecret: getEnv('SESSION_SECRET', devDefaults('1234567890')),
  session: {
    key: getEnv('SESSION_KEY', devSessionKey),
    useRedis: safeGet(() => getEnv('SESSION_USE_REDIS', devSessionUseRedis) === 'true'),
    sessionOptions: {
      // do not set session secret here!!
      cookie: {
        secure: safeGet(() => getEnv('SESSION_SECURE_COOKIE', false) === 'true')
      },
      proxy: safeGet(() => getEnv('SESSION_TRUST_PROXY', true) === 'true')
    },
    redisOptions: unpackRedisConfig('REDIS_URI', devRedis)
  },

  // APPLICATION INSIGHTS IN AZURE
  appInsights: {
    instrumentationKey: getEnv('APPINSIGHTS_INSTRUMENTATIONKEY', '')
  }
}
