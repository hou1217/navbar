import axios from 'axios'
import { Toast } from 'vant'

// const apiPath = 'http://www.ccbdd.com:9080/why-mobile/mobile/'
const apiPath = 'http://app.tianxiayunyou.com:9000/why-mobile/mobile/'
const listParams = params => {
  const data = params.data || {}
  return {
    cmd: params.cmd || 307,
    ver: params.ver || '1_4',
    data: {
      customerCode: data.customerCode || 'lyy',
      distance: data.distance || 50,
      lng: data.lng,
      lat: data.lat,
      pageIndex: data.pageIndex || 1,
      pageSize: data.pageSize || 20,
      type: data.type || '3-4-5-6-7-'
    }
  }
}
const detailParams = params => {
  const data = params.data || {}
  return {
    cmd: params.cmd || 103,
    ver: params.ver || '1_4',
    data: {
      spotId: data.spotId,
      lng: data.lng,
      lat: data.lat
    }
  }
}

const fetchApi = axios.create({
  baseURL: apiPath,
  timeout: 10000
})
fetchApi.interceptors.request.use(config => {
  Toast.loading({
    duration: 0,
    forbidClick: true,
    message: '加载中'
  })
  return config
}, error => {
  Toast.fail('请求失败')
  return Promise.reject(error)
})
fetchApi.interceptors.response.use(response => {
  Toast.clear()
  return response
}, error => {
  Toast.fail('加载失败')
  return Promise.reject(error)
})

const APIs = {
  GetSpotsList: params => fetchApi.post('webservice', listParams(params)),
  GetSpotDetail: params => fetchApi.post('webservice', detailParams(params))
}

export default APIs
