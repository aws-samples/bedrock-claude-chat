// import { Auth } from "aws-amplify";
import { Auth } from 'aws-amplify';
import axios, { AxiosError, AxiosResponse } from 'axios';
import useSWR, { SWRConfiguration } from 'swr';
// import useAlertSnackbar from "./useAlertSnackbar";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_ENDPOINT,
});

// // HTTP Request Preprocessing
api.interceptors.request.use(async (config) => {
  // If Authenticated, append ID Token to Request Header
  const user = await Auth.currentAuthenticatedUser();
  if (user) {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  config.headers['Content-Type'] = 'application/json';

  return config;
});

const fetcher = (url: string) => {
  return api.get(url).then((res) => res.data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcfWithParams = ([url, params]: [string, Record<string, any>]) => {
  return api
    .get(url, {
      params,
    })
    .then((res) => res.data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const getErrorMessage = (error: AxiosError<any>): string => {
//   return error.response?.data?.message ?? error.message;
// };

// FIXME:バックエンドができた時点で最適化する

/**
 * Hooks for Http Request
 * @returns
 */
const useHttp = () => {
  // const alert = useAlertSnackbar();

  return {
    /**
     * GET Request
     * Implemented with SWR
     * @param url
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: <Data = any, Error = any>(
      url: string | [string, ...unknown[]] | null,
      config?: SWRConfiguration
    ) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSWR<Data, AxiosError<Error>>(
        url,
        typeof url === 'string' ? fetcher : fetcfWithParams,
        {
          ...config,
        }
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOnce: <RES = any, DATA = any>(
      url: string,
      params?: DATA,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorProcess?: (err: any) => void
    ) => {
      return new Promise<AxiosResponse<RES>>((resolve, reject) => {
        api
          .get<RES, AxiosResponse<RES>, DATA>(url, {
            params,
          })
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            if (errorProcess) {
              errorProcess(err);
            } else {
              // alert.openError(getErrorMessage(err));
            }
            reject(err);
          });
      });
    },

    /**
     * POST Request
     * @param url
     * @param data
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: <RES = any, DATA = any>(
      url: string,
      data: DATA,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorProcess?: (err: any) => void
    ) => {
      return new Promise<AxiosResponse<RES>>((resolve, reject) => {
        api
          .post<RES, AxiosResponse<RES>, DATA>(url, data)
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            if (errorProcess) {
              errorProcess(err);
            } else {
              // alert.openError(getErrorMessage(err));
            }
            reject(err);
          });
      });
    },

    /**
     * PUT Request
     * @param url
     * @param data
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    put: <RES = any, DATA = any>(
      url: string,
      data: DATA,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorProcess?: (err: any) => void
    ) => {
      return new Promise<AxiosResponse<RES>>((resolve, reject) => {
        api
          .put<RES, AxiosResponse<RES>, DATA>(url, data)
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            if (errorProcess) {
              errorProcess(err);
            } else {
              // alert.openError(getErrorMessage(err));
            }
            reject(err);
          });
      });
    },
    /**
     * DELETE Request
     * @param url
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete: <RES = any, DATA = any>(
      url: string,
      params?: DATA,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorProcess?: (err: any) => void
    ) => {
      return new Promise<AxiosResponse<RES>>((resolve, reject) => {
        api
          .delete<RES, AxiosResponse<RES>, DATA>(url, {
            params,
          })
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            if (errorProcess) {
              errorProcess(err);
            } else {
              // alert.openError(getErrorMessage(err));
            }
            reject(err);
          });
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch: <RES = any, DATA = any>(
      url: string,
      data: DATA,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorProcess?: (err: any) => void
    ) => {
      return new Promise<AxiosResponse<RES>>((resolve, reject) => {
        api
          .patch<RES, AxiosResponse<RES>, DATA>(url, data)
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            if (errorProcess) {
              errorProcess(err);
            } else {
              // alert.openError(getErrorMessage(err));
            }
            reject(err);
          });
      });
    },
  };
};

export default useHttp;
