import { describe, expect, it } from 'vitest';
import { convertMessageMapToArray } from '../MessageUtils';
import { DisplayMessageContent, MessageMap } from '../../@types/conversation';

describe('convertMessageMapToArray', () => {
  it('1件のみ', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: [],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '1');
    expect(actual).toEqual(expected);
  });

  it('単純な親子関係:2件', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2'],
        feedback: null,
        usedChunks: null,
      },
      '2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: [],
        sibling: ['2'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '2');
    expect(actual).toEqual(expected);
  });

  it('単純な親子関係:3件', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2'],
        feedback: null,
        usedChunks: null,
      },
      '2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2',
          },
        ],
        parent: '1',
        children: ['3'],
        feedback: null,
        usedChunks: null,
      },
      '3': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-3',
          },
        ],
        parent: '2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: ['3'],
        sibling: ['2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '3',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-3',
            contentType: 'text',
          },
        ],
        parent: '2',
        children: [],
        sibling: ['3'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '3');
    expect(actual).toEqual(expected);
  });

  it('子が複数:単純な分岐:1件目を選択', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-1',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '2-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-1',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: [],
        sibling: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '2-1');
    expect(actual).toEqual(expected);
  });

  it('子が複数:単純な分岐:2件目を選択', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-1',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '2-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: [],
        sibling: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '2-2');
    expect(actual).toEqual(expected);
  });

  it('子が複数:分岐後に会話が続いている:末端を選択', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-1',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '2-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2',
          },
        ],
        parent: '1',
        children: ['2-2-1'],
        feedback: null,
        usedChunks: null,
      },
      '2-2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2-1',
          },
        ],
        parent: '2-2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: ['2-2-1'],
        sibling: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2-1',
            contentType: 'text',
          },
        ],
        parent: '2-2',
        children: [],
        sibling: ['2-2-1'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '2-2-1');
    expect(actual).toEqual(expected);
  });

  it('子が複数:分岐後に会話が続いている:末端以外を選択しても末端まで表示する', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-1',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '2-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2',
          },
        ],
        parent: '1',
        children: ['2-2-1'],
        feedback: null,
        usedChunks: null,
      },
      '2-2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2-1',
          },
        ],
        parent: '2-2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: ['2-2-1'],
        sibling: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2-1',
            contentType: 'text',
          },
        ],
        parent: '2-2',
        children: [],
        sibling: ['2-2-1'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '2-2');
    expect(actual).toEqual(expected);
  });

  it('分岐が複数:選択した要素配下のものは1要素目が選択された状態になる', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-1',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '2-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2',
          },
        ],
        parent: '1',
        children: ['2-2-1'],
        feedback: null,
        usedChunks: null,
      },
      '2-2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2-1',
          },
        ],
        parent: '2-2',
        children: ['2-2-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-2-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2-2',
          },
        ],
        parent: '2-2-1',
        children: ['2-2-2-1', '2-2-2-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-2-2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2-2-1',
          },
        ],
        parent: '2-2-2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '2-2-2-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2-2-2',
          },
        ],
        parent: '2-2-2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: ['2-2-1'],
        sibling: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2-1',
            contentType: 'text',
          },
        ],
        parent: '2-2',
        children: ['2-2-2'],
        sibling: ['2-2-1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2-2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2-2',
            contentType: 'text',
          },
        ],
        parent: '2-2-1',
        children: ['2-2-2-1', '2-2-2-2'],
        sibling: ['2-2-2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-2-2-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-2-2-1',
            contentType: 'text',
          },
        ],
        parent: '2-2-2',
        children: [],
        sibling: ['2-2-2-1', '2-2-2-2'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '2-2');
    expect(actual).toEqual(expected);
  });

  it('systemが除外される', () => {
    const data: MessageMap = {
      system: {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['1'],
        feedback: null,
        usedChunks: null,
      },
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: 'system',
        children: ['2'],
        feedback: null,
        usedChunks: null,
      },
      '2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: 'system',
        children: ['2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: [],
        sibling: ['2'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '2');
    expect(actual).toEqual(expected);
  });

  it('systemが除外される:1件目から分岐:1-1を選択', () => {
    const data: MessageMap = {
      system: {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['1-1', '1-2'],
        feedback: null,
        usedChunks: null,
      },
      '1-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-1',
          },
        ],
        parent: 'system',
        children: ['1-1-1'],
        feedback: null,
        usedChunks: null,
      },
      '1-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-2',
          },
        ],
        parent: 'system',
        children: ['1-2-1'],
        feedback: null,
        usedChunks: null,
      },
      '1-1-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-1-1',
          },
        ],
        parent: '1-1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '1-2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-2-1',
          },
        ],
        parent: '1-2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1-1',
            contentType: 'text',
          },
        ],
        parent: 'system',
        children: ['1-1-1'],
        sibling: ['1-1', '1-2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '1-1-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1-1-1',
            contentType: 'text',
          },
        ],
        parent: '1-1',
        children: [],
        sibling: ['1-1-1'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '1-1');
    expect(actual).toEqual(expected);
  });

  it('systemが除外される:1件目から分岐:1-2を選択', () => {
    const data: MessageMap = {
      system: {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['1-1', '1-2'],
        feedback: null,
        usedChunks: null,
      },
      '1-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-1',
          },
        ],
        parent: 'system',
        children: ['1-1-1'],
        feedback: null,
        usedChunks: null,
      },
      '1-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-2',
          },
        ],
        parent: 'system',
        children: ['1-2-1'],
        feedback: null,
        usedChunks: null,
      },
      '1-1-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-1-1',
          },
        ],
        parent: '1-1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '1-2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-2-1',
          },
        ],
        parent: '1-2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1-2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1-2',
            contentType: 'text',
          },
        ],
        parent: 'system',
        children: ['1-2-1'],
        sibling: ['1-1', '1-2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '1-2-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1-2-1',
            contentType: 'text',
          },
        ],
        parent: '1-2',
        children: [],
        sibling: ['1-2-1'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '1-2');
    expect(actual).toEqual(expected);
  });

  it('systemが除外される:1件目から分岐:存在しないキーを選択', () => {
    const data: MessageMap = {
      system: {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['1-1', '1-2'],
        feedback: null,
        usedChunks: null,
      },
      '1-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-1',
          },
        ],
        parent: 'system',
        children: ['1-1-1'],
        feedback: null,
        usedChunks: null,
      },
      '1-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-2',
          },
        ],
        parent: 'system',
        children: ['1-2-1'],
        feedback: null,
        usedChunks: null,
      },
      '1-1-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-1-1',
          },
        ],
        parent: '1-1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '1-2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1-2-1',
          },
        ],
        parent: '1-2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1-1',
            contentType: 'text',
          },
        ],
        parent: 'system',
        children: ['1-1-1'],
        sibling: ['1-1', '1-2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '1-1-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1-1-1',
            contentType: 'text',
          },
        ],
        parent: '1-1',
        children: [],
        sibling: ['1-1-1'],
        feedback: null,
        usedChunks: null,
      },
    ];
    const actual = convertMessageMapToArray(data, '999');
    expect(actual).toEqual(expected);
  });

  it('messageMapにデータがない場合はから配列を返す', () => {
    const data: MessageMap = {};

    const actual = convertMessageMapToArray(data, '1');
    expect(actual).toEqual([]);
  });

  it('存在しないIDの場合は先頭のChildを表示', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-1',
          },
        ],
        parent: '1',
        children: ['3-1', '3-2'],
        feedback: null,
        usedChunks: null,
      },
      '2-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2-2',
          },
        ],
        parent: '1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '3-1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-3-1',
          },
        ],
        parent: '2-1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
      '3-2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-3-2',
          },
        ],
        parent: '2-1',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2-1', '2-2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2-1',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: ['3-1', '3-2'],
        sibling: ['2-1', '2-2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '3-1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-3-1',
            contentType: 'text',
          },
        ],
        parent: '2-1',
        children: [],
        sibling: ['3-1', '3-2'],
        feedback: null,
        usedChunks: null,
      },
    ];

    const actual = convertMessageMapToArray(data, '999');
    expect(actual).toEqual(expected);
  });

  it('参照が途中で切れた場合は途中までの配列を返す:指定のIDが存在する', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2'],
        feedback: null,
        usedChunks: null,
      },
      '2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2',
          },
        ],
        parent: 'dummy',
        children: ['3'],
        feedback: null,
        usedChunks: null,
      },
      '3': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-3',
          },
        ],
        parent: '2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['3'],
        sibling: ['2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '3',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-3',
            contentType: 'text',
          },
        ],
        parent: '2',
        children: [],
        sibling: ['3'],
        feedback: null,
        usedChunks: null,
      },
    ];

    const actual = convertMessageMapToArray(data, '3');
    expect(actual).toEqual(expected);
  });

  it('参照が途中で切れた場合は途中までの配列を返す:指定のIDが存在しない', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2'],
        feedback: null,
        usedChunks: null,
      },
      '2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2',
          },
        ],
        parent: '1',
        children: ['4'],
        feedback: null,
        usedChunks: null,
      },
      '3': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-3',
          },
        ],
        parent: '2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: [],
        sibling: ['2'],
        feedback: null,
        usedChunks: null,
      },
    ];

    const actual = convertMessageMapToArray(data, '9');
    expect(actual).toEqual(expected);
  });

  it('循環参照している場合中断する:指定のIDが存在する', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['3'],
        feedback: null,
        usedChunks: null,
      },
      '2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2',
          },
        ],
        parent: '3',
        children: ['3'],
        feedback: null,
        usedChunks: null,
      },
      '3': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-3',
          },
        ],
        parent: '2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['3'],
        sibling: ['2'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '3',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-3',
            contentType: 'text',
          },
        ],
        parent: '2',
        children: [],
        sibling: ['3'],
        feedback: null,
        usedChunks: null,
      },
    ];

    const actual = convertMessageMapToArray(data, '3');
    expect(actual).toEqual(expected);
  });

  it('循環参照している場合中断する:指定のIDが存在しない', () => {
    const data: MessageMap = {
      '1': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-1',
          },
        ],
        parent: null,
        children: ['2'],
        feedback: null,
        usedChunks: null,
      },
      '2': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-2',
          },
        ],
        parent: '1',
        children: ['1'],
        feedback: null,
        usedChunks: null,
      },
      '3': {
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            contentType: 'text',
            body: 'message-3',
          },
        ],
        parent: '2',
        children: [],
        feedback: null,
        usedChunks: null,
      },
    };
    const expected: DisplayMessageContent[] = [
      {
        id: '1',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-1',
            contentType: 'text',
          },
        ],
        parent: null,
        children: ['2'],
        sibling: ['1'],
        feedback: null,
        usedChunks: null,
      },
      {
        id: '2',
        role: 'user',
        model: 'claude-v2',
        content: [
          {
            body: 'message-2',
            contentType: 'text',
          },
        ],
        parent: '1',
        children: [],
        sibling: ['2'],
        feedback: null,
        usedChunks: null,
      },
    ];

    const actual = convertMessageMapToArray(data, '99');
    expect(actual).toEqual(expected);
  });
});
