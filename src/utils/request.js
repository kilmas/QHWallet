import * as Qs from 'qs';
import * as axios from 'axios';

const baseURL = ''; //'https://admin-api.staging.riodefi.com/api/v1';
const scanURL = '';
const rateURL = '';
const btcComUrl = 'https://chain.api.btc.com/v3/';

export const ENV = 'test'; // production | test | staging

const fetchTimeout = 30000;

const errStatusTips = {
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

let host;
if (ENV === 'production') {
  host = '';
} else if (ENV === 'test') {
  host = '';
} else if (ENV === 'staging') {
  host = '';
} else {
  host = '';
}

const instance = axios.create({
  baseURL,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});
const scanInstance = axios.create({
  scanURL,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});
const rateInstance = axios.create({
  rateURL,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});
const btcComInstance = axios.create({
  btcComUrl,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

//响应拦截器即异常处理
btcComInstance.interceptors.response.use(
  res => res,
  err => {
    if (err && err.response) {
      err.message = `${err.response.status}: ${
        errStatusTips[err.response.status]
      }`;
    } else {
      err.message = '连接到服务器失败';
    }
    return Promise.reject(err.message);
  },
);

export const btcComRequest = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      btcComInstance
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
  getScan: (url, params) => {
    console.log(url);
    return new Promise((resolve, reject) => {
      scanInstance
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
  getExchangeRate: (url, params) => {
    return new Promise((resolve, reject) => {
      rateInstance
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
  hostPost: (url, params) => {
    return new Promise((resolve, reject) => {
      hostInstance
        .post(url, {
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
};

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
      err.message = `${err.response.status}: ${
        errStatusTips[err.response.status]
      }`;
    } else {
      err.message = '连接到服务器失败';
    }
    return Promise.reject(err.message);
  },
);

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
      err.message = `${err.response.status}: ${
        errStatusTips[err.response.status]
      }`;
    } else {
      err.message = '连接到服务器失败';
    }
    return Promise.reject(err.message);
  },
);

scanInstance.interceptors.response.use(
  ({status, data}) => {
    if (status === 200) {
      return data;
    }
    return Promise.reject(status);
  },
  err => {
    if (err && err.response) {
      err.message = `${err.response.status}: ${
        errStatusTips[err.response.status]
      }`;
    } else {
      err.message = '连接到服务器失败';
    }
    return Promise.reject(err.message);
  },
);

rateInstance.interceptors.response.use(
  ({status, data}) => {
    if (status === 200) {
      return data;
    }
    return Promise.reject(status);
  },
  err => {
    if (err && err.response) {
      err.message = `${err.response.status}: ${
        errStatusTips[err.response.status]
      }`;
    } else {
      err.message = '连接到服务器失败';
    }
    return Promise.reject(err.message);
  },
);

export const hostRequest = {
  get: url => fetch(host + url).then(res => res.json()),

  post: (url, params = {}) => {
    const opt = {};
    opt.method = 'post';
    opt.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    opt.body = JSON.stringify(params);
    return fetch(host + url, opt).then(res => res.json());
  },

  uploadImg: async (imgUri, ossInfo) => {
    const formData = new FormData(); // 如果需要上传多张图片,需要遍历数组,把图片的路径数组放入formData中
    const file = {uri: imgUri, type: 'multipart/form-data', name: 'image.png'}; // 这里的key(uri和type和name)不能改变,
    formData.append('OSSAccessKeyId', ossInfo.OSSAccessKeyId);
    formData.append('policy', ossInfo.policy);
    formData.append('Signature', ossInfo.Signature);
    const fileName = imgUri.substring(
      imgUri.lastIndexOf('/') + 1,
      imgUri.length,
    );
    const key = `${ossInfo.key}${fileName}`;
    formData.append('key', key);
    formData.append('success_action_status', 200);
    formData.append('file', file);

    const opt = {
      method: 'POST',
      body: formData,
    };

    await fetch(ossInfo.uploadActionURL, opt);
    return ossInfo.uploadActionURL + key;
  },
};

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
  getScan: (url, params) => {
    console.log(url);
    return new Promise((resolve, reject) => {
      scanInstance
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
  getExchangeRate: (url, params) => {
    return new Promise((resolve, reject) => {
      rateInstance
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
  hostPost: (url, params) => {
    return new Promise((resolve, reject) => {
      hostInstance
        .post(url, {
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
  getBalance: (addresss) => {
    const addressArr = addresss.split(',')
    return new Promise((resolve, reject) => {
      hostInstance
        .post(url, {
          ...params,
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};

export const APIS = {
  receiveBTC: '/wallets/deposit/address/btc/',
  withdrawBTC: '/wallets/withdraw/btc',
  transferHistory: '/asset/transfer/history/',
  withdraw: '/api/v1/wallets/withdraw/request/', // 提现
};

export const timeoutPromise = (fetchPromise, timeout = fetchTimeout) => {
  const abortPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('网络请求超时\nNetwork request timed out'))
    }, timeout)
  })

  return Promise.race([fetchPromise, abortPromise])
}


const fibosInstance = axios.create({
  baseURL: 'https://api.fibos.rocks',
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fibosRequest = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      fibosInstance
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
      fibosInstance
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