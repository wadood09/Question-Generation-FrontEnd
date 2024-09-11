
// Create Axios instance
const axiosInstance = axios.create({
    baseURL: 'https://localhost:7125/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        if (config.skipInterceptors === true) {
            return config;
        }
        console.log('Request Interceptor Active');
        config.headers['Authorization'] = `Bearer ${localStorage.getItem('access-token')}`;
        console.log(config)
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (response.config.skipInterceptors === true) {
            return response;
        }
        console.log('Response Interceptor Active');
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        console.log('Response Interceptor Active');
        if (error.config.skipInterceptors) {
            return Promise.reject(error);
        }

        // Check if the error is due to an expired token
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Send a request to your backend to refresh the token
                await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

                var newAccessToken = localStorage.getItem('access-token');
                if (newAccessToken) {
                    axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
                }

                // Retry the original request
                console.log(originalRequest)
                console.log('hgcmfxmm')
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                window.location.href = '/Signin/signin.html'
                console.error('Error refreshing token:', refreshError);
                return Promise.reject(refreshError);
            }
        }
        console.log('Axios response interceptor', error)
        return Promise.reject(error);
    }
);

window.axiosInstance = axiosInstance