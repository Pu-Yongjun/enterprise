import axios from "axios";
import store from "../store";
import router from "../router";
import { Message } from "element-ui";

// 设置全局 axios 默认值
axios.defaults.timeout = 5000; // 5000的超时验证
axios.defaults.headers.post["Content-Type"] = "application/json;charset=UTF-8";

// 创建一个axios实例
const instance = axios.create();

axios.interceptors.request.use = instance.interceptors.request.use;

// request拦截器
instance.interceptors.request.use(
  config => {
    // 每次发送请求之前检测都vuex存有token,那么都要放在请求头发送给服务器
    if (store.state.User.Token) {
      config.headers.Authorization = `${store.state.User.Token}`;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
// respone拦截器
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 默认除了2XX之外的都是错误的，就会走这里
    if (error.response) {
      switch (error.response.status) {
        case 401:
          store.commit("clearUser"); // 可能是token过期，清除它
          router.replace({
            // 跳转到登录页面
            path: "login",
            query: { redirect: router.currentRoute.fullPath }
            // 将跳转的路由path作为参数，登录成功后跳转到该路由
          });
          Message.error("重新认证");
          break;
        case 400:
          Message.error(error.response.data.message);
          break;
        case 501:
          Message.error("网络错误");
          break;
        case 500:
          if (error.response.data.message) {
            Message.error(error.response.data.message);
          } else {
            Message.error("服务器错误");
          }
          break;
        case 504:
          Message.error("网络错误");
          break;
        default:
          break;
      }
    }
    return Promise.reject(error.response);
  }
);

export default instance;
