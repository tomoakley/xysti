import Cookies from 'js-cookie'

export const getCookieValue = (key) => {
  return new Promise(resolve => { // eslint-disable-line no-unused-vars
    resolve(Cookies.get(key))
  })
  .catch((error) => {
    console.log('get cookie error', error)
  })
}

export const setCookieValue = (key, value) => {
  Cookies.set(key, value)
}

export const removeCookie = (key) => {
  Cookies.remove(key)
}
