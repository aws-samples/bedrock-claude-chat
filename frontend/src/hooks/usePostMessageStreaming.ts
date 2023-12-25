import { Auth } from 'aws-amplify';
import { PostMessageRequest } from '../@types/conversation';
import { create } from 'zustand';
import i18next from 'i18next';

const WS_ENDPOINT: string = import.meta.env.VITE_APP_WS_ENDPOINT;

const usePostMessageStreaming = create<{
  post: (
    input: PostMessageRequest,
    dispatch: (completion: string) => void
  ) => Promise<void>;
}>(() => {
  const post = async (
    input: PostMessageRequest,
    dispatch: (completion: string) => void
  ) => {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();

    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(WS_ENDPOINT);
      let completion = '';

      ws.onopen = () => {
        ws.send(JSON.stringify({ ...input, token }));
      };

      ws.onmessage = (message) => {
        console.log(message.data);
        try {
          if (message.data === '') {
            return;
          }

          const data = JSON.parse(message.data);

          if (data.completion || data.completion === '') {
            if (completion.endsWith('▍')) {
              completion = completion.slice(0, -1);
            }

            completion += data.completion + (data.stop_reason ? '' : '▍');
            dispatch(completion);
            if (data.stop_reason) {
              ws.close();
            }
          } else if (data.status) {
            dispatch('▍');
          } else {
            ws.close();
            console.error(data);
            throw new Error(i18next.t('error.predict.invalidResponse'));
          }
        } catch (e) {
          console.error(e);
          reject(i18next.t('error.predict.general'));
        }
      };

      ws.onerror = (e) => {
        ws.close();
        console.error(e);
        reject(i18next.t('error.predict.general'));
      };
      ws.onclose = () => {
        resolve();
      };
    });
  };

  return {
    post,
  };
});
export default usePostMessageStreaming;
