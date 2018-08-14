import axios from 'axios';

var instance = axios.create({
	baseURL: 'http://127.0.0.1:8080/api'
});

//在实例创建后改变默认值
instance.defaults.headers.common['Authorization'] = window.sessionStorage.getItem('AUTH_TOKEN');

//覆盖库的超时默认值
//现在所有请求将在超时前等待2.5秒
instance.defaults.timeout = 2500;

//添加请求拦截器
instance.interceptors.request.use(
	function(config) {
		//在发送请求之前做某事
		return config;
	},
	function(error) {
		//请求错误时做些事
		return Promise.reject(error);
	}
);

//添加响应拦截器
instance.interceptors.response.use(
	function(response) {
		//对响应数据做些事
		return response;
	},
	function(error) {
		//请求错误时做些事
		return Promise.reject(error);
	}
);

export default instance;
