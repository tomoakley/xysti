import urllib from 'url'
import {reject} from 'ramda'

function isEmptyArray(val) {
  return Array.isArray(val) && val.length === 0
}

/**
 * Wrapper around node's url.format that fixes problem of adding an erroneous extra
 * ampersand to query string when a query parameter is an empty array
 */
export default function urlFormat({query, ...otherUrlParams}) {
  if (query !== undefined) query = reject(isEmptyArray, query) // eslint-disable-line no-param-reassign
  return urllib.format({
    query,
    ...otherUrlParams
  })
}
