import { Auth } from 'aws-amplify';
import { PostMessageRequest } from '../@types/conversation';
import { create } from 'zustand';
import i18next from 'i18next';

const WS_ENDPOINT: string = import.meta.env.VITE_APP_WS_ENDPOINT;

const usePostMessageStreaming = create<{
  post: (params: {
    input: PostMessageRequest;
    hasKnowledge?: boolean;
    dispatch: (completion: string) => void;
  }) => Promise<void>;
}>(() => {
  return {
    post: async ({ input, dispatch, hasKnowledge }) => {
      if (hasKnowledge) {
        dispatch(i18next.t('bot.label.retrivingKnowledge'));
      } else {
        dispatch(i18next.t('app.chatWaitingSymbol'));
      }

      const token = (await Auth.currentSession()).getIdToken().getJwtToken();

      return new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(WS_ENDPOINT);
        let completion = '';

        ws.onopen = () => {
          ws.send(JSON.stringify({ ...input, token }));
        };

        ws.onmessage = (message) => {
          try {
            if (message.data === '') {
              return;
            }

            const data = JSON.parse(message.data);

            if (data.completion || data.completion === '') {
              if (completion.endsWith(i18next.t('app.chatWaitingSymbol'))) {
                completion = completion.slice(0, -1);
              }

              completion +=
                data.completion +
                (data.stop_reason ? '' : i18next.t('app.chatWaitingSymbol'));
              dispatch(completion);
              if (data.stop_reason) {
                ws.close();
              }
            } else if (data.status) {
              dispatch(i18next.t('app.chatWaitingSymbol'));
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
    },
  };
});

export default usePostMessageStreaming;
