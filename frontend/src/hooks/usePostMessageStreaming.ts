import { Auth } from 'aws-amplify';
import { PostMessageRequest } from '../@types/conversation';
import { create } from 'zustand';
import i18next from 'i18next';

const WS_ENDPOINT: string = import.meta.env.VITE_APP_WS_ENDPOINT;
const CHUNK_SIZE = 32 * 1024; //32KB

const usePostMessageStreaming = create<{
  post: (params: {
    input: PostMessageRequest;
    hasKnowledge?: boolean;
    dispatch: (completion: string) => void;
  }) => Promise<string>;
}>(() => {
  return {
    post: async ({ input, dispatch, hasKnowledge }) => {
      if (hasKnowledge) {
        dispatch(i18next.t('bot.label.retrievingKnowledge'));
      } else {
        dispatch(i18next.t('app.chatWaitingSymbol'));
      }
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      const payloadString = JSON.stringify({
        ...input,
        token,
      });

      // chunking
      const chunkedPayloads: string[] = [];
      const chunkCount = Math.ceil(payloadString.length / CHUNK_SIZE);
      for (let i = 0; i < chunkCount; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, payloadString.length);
        chunkedPayloads.push(payloadString.substring(start, end));
      }

      let receivedCount = 0;
      return new Promise<string>((resolve, reject) => {
        let completion = '';
        const ws = new WebSocket(WS_ENDPOINT);

        ws.onopen = () => {
          ws.send('START');
        };

        ws.onmessage = (message) => {
          try {
            if (
              message.data === '' ||
              message.data === 'Message sent.' ||
              // Ignore timeout message from api gateway
              message.data.startsWith(
                '{"message": "Endpoint request timed out",'
              )
            ) {
              return;
            } else if (message.data === 'Session started.') {
              chunkedPayloads.forEach((chunk, index) => {
                ws.send(
                  JSON.stringify({
                    index,
                    part: chunk,
                  })
                );
              });
              return;
            } else if (message.data === 'Message part received.') {
              receivedCount++;
              if (receivedCount === chunkedPayloads.length) {
                ws.send('END');
              }
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
          resolve(completion);
        };
      });
    },
  };
});

export default usePostMessageStreaming;
