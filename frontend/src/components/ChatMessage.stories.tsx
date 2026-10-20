import type { Meta } from '@storybook/react-vite';
import { useTranslation } from 'react-i18next';

import ChatMessage from './ChatMessage';
import { DisplayMessageContent } from '../@types/conversation';
export default { component: ChatMessage } satisfies Meta<typeof ChatMessage>;

export const Conversation = () => {
  const messages: DisplayMessageContent[] = [
    {
      id: '1',
      role: 'user',
      content: [
        {
          contentType: 'text',
          body: 'What is RAG?',
        },
        {
          contentType: 'attachment',
          fileName: 'AboutRAG.txt',
          body: btoa('RAG stands for Retrieval-Augmented Generation.'),
        },
        {
          contentType: 'attachment',
          fileName: 'RAG-in-detail.pdf',
          body: '',
        },
      ],
      model: 'claude-v3.5-sonnet',
      feedback: null,
      usedChunks: null,
      parent: null,
      children: [],
      sibling: [],
      thinkingLog: null,
    },
    {
      id: '2',
      role: 'assistant',
      content: [
        {
          contentType: 'text',
          body: "RAG stands for Retrieval-Augmented Generation[^1]. It is an approach in natural language processing (NLP)[^2] that combines the capabilities of large language models with information retrieval from external knowledge sources.\n\nThe key idea behind RAG is to first retrieve relevant information from a knowledge base or corpus of documents, and then use that retrieved information along with the language model's knowledge to generate a final output response.\n\nThe process typically involves:\n\n1) Encoding the input query using the language model.\n\n2) Retrieving relevant documents/passages from a knowledge source based on the encoded query representation.\n\n3) Conditioning the language model on the retrieved knowledge along with the original query to generate the final output.\n\nThis allows language models to go beyond just relying on their pre-trained knowledge and incorporate relevant external information when producing responses. RAG models have shown improved performance on knowledge-intensive NLP tasks like open-domain question answering compared to using just the language model alone.\n\nSome examples of RAG models include RAG from Facebook AI, ColBERT from Stanford, and DPR from Facebook AI Research. The approach is an active area of research aimed at making language models more knowledgeable and factual.",
        },
      ],
      model: 'claude-v3.5-sonnet',
      feedback: null,
      usedChunks: [
        {
          content: 'About RAG',
          contentType: 'url',
          source: 'http://example.com/AboutRAG.txt',
          rank: 1,
        },
        {
          content: 'RAG in detail',
          contentType: 's3',
          source: 's3://example/RAG-in-detail.pdf',
          rank: 2,
        },
      ],
      parent: null,
      children: [],
      sibling: [],
      thinkingLog: null,
    },
  ];
  return (
    <>
      {messages?.map((message, idx) => (
        <div
          key={idx}
          className={`${
            message.role === 'assistant' ? 'bg-aws-squid-ink-light/5 dark:bg-aws-squid-ink-dark/5' : 'dark:text-aws-font-color-dark'
          }`}>
          <ChatMessage
            chatContent={message}
          />

          <div className="w-full border-b border-aws-squid-ink-light/10 dark:border-aws-squid-ink-dark/10"></div>
        </div>
      ))}
    </>
  );
};

export const ConversationThinking = () => {
  const { t } = useTranslation();
  const messages: DisplayMessageContent[] = [
    {
      id: '1',
      role: 'user',
      content: [
        {
          contentType: 'text',
          body: "Check tomorrow's weather and suggest places to go with my family.",
        },
      ],
      model: 'claude-v3.5-sonnet',
      feedback: null,
      usedChunks: null,
      parent: null,
      children: [],
      sibling: [],
      thinkingLog: null,
    },
    {
      id: '2',
      role: 'assistant',
      content: [
        {
          contentType: 'text',
          body: '',
        },
      ],
      model: 'claude-v3.5-sonnet',
      feedback: null,
      usedChunks: null,
      parent: null,
      children: [],
      sibling: [],
      thinkingLog: [],
    },
  ];
  return (
    <>
      {messages?.map((message, idx) => (
        <div
          key={idx}
          className={`${
            message.role === 'assistant' ? 'bg-aws-squid-ink-light/5 dark:bg-aws-squid-ink-dark/5' : 'dark:text-aws-font-color-dark'
          }`}>
          <ChatMessage
            chatContent={message}
            tools={[
              {
                thought: t('agent.progress.label'),
                tools: {},
              },
            ]}
          />

          <div className="w-full border-b border-aws-squid-ink-light/10 dark:border-aws-squid-ink-dark/10"></div>
        </div>
      ))}
    </>
  );
};

export const ConversationWithAgnet = () => {
  const messages: DisplayMessageContent[] = [
    {
      id: '1',
      role: 'user',
      content: [
        {
          contentType: 'text',
          body: "Check tomorrow's weather and suggest places to go with my family.",
        },
      ],
      model: 'claude-v3.5-sonnet',
      feedback: null,
      usedChunks: null,
      parent: null,
      children: [],
      sibling: [],
      thinkingLog: null,
    },
    {
      id: '2',
      role: 'assistant',
      content: [
        {
          contentType: 'reasoning',
          text: "Tomorrow's weather will be clear skies. According to the search results, the recommended leisure activity for a sunny day is an amusement park.",
          signature: '',
          redactedContent: '',
        },
        {
          contentType: 'text',
          body: 'I recommend going to an amusement park.[^tool2_cwa@0]',
        },
      ],
      model: 'claude-v3.5-sonnet',
      feedback: null,
      usedChunks: null,
      parent: null,
      children: [],
      sibling: [],
      thinkingLog: [
        {
          role: 'assistant',
          content: [
            {
              contentType: 'reasoning',
              text: "To answer the user's question, I have 'get_weather' tool.",
              signature: '',
              redactedContent: '',
            },
            {
              contentType: 'text',
              body: "Use 'get_weather' tool to check tomorrow's weather.",
            },
            {
              contentType: 'toolUse',
              body: {
                toolUseId: 'tool1_cwa',
                name: 'get_weather',
                input: {},
              },
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              contentType: 'toolResult',
              body: {
                toolUseId: 'tool1_cwa',
                content: [
                  {
                    json: {
                      source_id: 'tool1_cwa',
                      content: {
                        weather: 'Clear skies',
                      },
                    },
                  },
                ],
                status: 'success',
              },
            },
          ],
        },
        {
          role: 'assistant',
          content: [
            {
              contentType: 'text',
              body: "Tomorrow's weather will be clear skies.[^tool1_cwa]\nSearch for recommended family leisure places on clear weather.",
            },
            {
              contentType: 'toolUse',
              body: {
                toolUseId: 'tool2_cwa',
                name: 'internet_search',
                input: {
                  country: 'en-us',
                  query: 'recommendation family leisure places clear weather',
                  time_limit: 'd',
                },
              },
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              contentType: 'toolResult',
              body: {
                toolUseId: 'tool2_cwa',
                content: [
                  {
                    json: {
                      source_id: 'tool2_cwa@0',
                      content: 'amusement park',
                    },
                  },
                  {
                    json: {
                      source_id: 'tool2_cwa@1',
                      content: 'athletic field',
                    },
                  },
                  {
                    json: {
                      source_id: 'tool2_cwa@2',
                      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                    },
                  },
                ],
                status: 'success',
              },
            },
          ],
        },
      ],
    },
  ];
  return (
    <>
      {messages?.map((message, idx) => (
        <div
          key={idx}
          className={`${
            message.role === 'assistant' ? 'bg-aws-squid-ink-light/5 dark:bg-aws-squid-ink-dark/5' : 'dark:text-aws-font-color-dark'
          }`}>
          <ChatMessage
            chatContent={message}
            relatedDocuments={[
              {
                content: {
                  json: {
                    weather: 'Clear skies',
                  },
                },
                sourceId: 'tool1_cwa',
                sourceName: 'get_weather',
              },
              {
                content: {
                  text: 'amusement park',
                },
                sourceId: 'tool2_cwa@0',
                sourceName: 'Amusement park Guidebook',
                sourceLink: 'http://example.com/amusement_park_guidebook.html',
              },
              {
                content: {
                  text: 'athletic field',
                },
                sourceId: 'tool2_cwa@1',
                sourceName: 'Athletic field Guidebook',
                sourceLink: 'http://example.com/athletic_field_guidebook.html',
              },
              {
                content: {
                  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                },
                sourceId: 'tool2_cwa@2',
                sourceName: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                sourceLink: 'http://example.com/lorem_ipsim.html?keyword=Lorem%20ipsum%20dolor%20sit%20amet%20consectetur%20adipiscing%20elit%20sed%20do%20eiusmod%20tempor%20incididunt%20ut%20labore%20et%20dolore%20magna%20aliqua',
              },
            ]}
          />

          <div className="w-full border-b border-aws-squid-ink-light/10 dark:border-aws-squid-ink-dark/10"></div>
        </div>
      ))}
    </>
  );
};
