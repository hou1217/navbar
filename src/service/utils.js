
const testUA = pattern => pattern.test(window.navigator.userAgent.toLowerCase())
export const UA = {
  iphone: testUA(/iphone/),
  ipad: testUA(/ipad/),
  android: testUA(/android/),
  weixin: testUA(/micromessenger/)
}

export const fixSpotImage = image => {
  const defaultPlaceholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mN8958BAzAOZUEAmNwTTeAV+t4AAAAASUVORK5CYII='
  return image || defaultPlaceholderImage
}
