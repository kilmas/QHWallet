import * as Qs from 'qs';
import * as axios from 'axios';

const baseURL = 'https://chain.api.btc.com/v3/';
const instance = axios.create({
  baseURL,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

//响应拦截器即异常处理
instance.interceptors.response.use(
  ({status, data}) => {
    if (status === 200) {
      return data;
    }
    return Promise.reject(status);
  },
  err => {
    if (err && err.response) {
      let errStatusTips = {
        400: '错误请求',
        401: '未授权，请重新登录',
        403: '拒绝访问',
        404: '请求错误,未找到该资源',
        405: '请求方法未允许',
        408: '请求超时',
        500: '服务器端出错',
        501: '网络未实现',
        502: '网络错误',
        503: '服务不可用',
        504: '网络超时',
        505: 'http版本不支持该请求',
      };

      err.message = errStatusTips[err.response.status];
    } else {
      err.message = '连接到服务器失败';
    }
    return Promise.reject(err.message);
  },
);

// Make a request for a user with a given ID
export const request = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      instance
        .get(url, {
          ...params,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  post: (url, params, option) => {
    return new Promise((resolve, reject) => {
      instance
        .post(url, params, option)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
