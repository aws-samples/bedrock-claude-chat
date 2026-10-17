import React, { ReactNode, useCallback, useMemo } from 'react';
import { BaseProps } from '../@types/common';
import Markdown, { MarkdownHooks, Options as MarkdownOptions } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ButtonDownload from './ButtonDownload';
import ButtonCopy from './ButtonCopy';
import { RelatedDocument } from '../@types/conversation';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { produce } from 'immer';
import rehypeExternalLinks, { Options as RehypeExternalLinksOptions } from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import rehypeMermaid, { RehypeMermaidOptions } from 'rehype-mermaid';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { onlyText } from 'react-children-utilities';
import RelatedDocumentViewer from './RelatedDocumentViewer';

type Props = BaseProps & {
  children: string;
  isStreaming?: boolean;
  relatedDocuments?: RelatedDocument[];
  messageId: string;
};

const useRelatedDocumentsState = create<{
  relatedDocuments: {
    [key: string]: RelatedDocument;
  };
  setRelatedDocument: (key: string, relatedDocument: RelatedDocument) => void;
  resetRelatedDocument: (key: string) => void;
}>((set, get) => ({
  relatedDocuments: {},
  setRelatedDocument: (key, relatedDocument) => {
    set({
      relatedDocuments: produce(get().relatedDocuments, (draft) => {
        draft[key] = relatedDocument;
      }),
    });
  },
  resetRelatedDocument: (key) => {
    set({
      relatedDocuments: produce(get().relatedDocuments, (draft) => {
        delete draft[key];
      }),
    });
  },
}));

const RelatedDocumentLink: React.FC<{
  relatedDocument?: RelatedDocument;
  sourceId: string;
  linkId: string;
  children: ReactNode;
}> = (props) => {
  const { relatedDocuments, setRelatedDocument, resetRelatedDocument } = useRelatedDocumentsState();

  return (
    <>
      <a
        className={twMerge(
          'mx-0.5 ',
          props.relatedDocument != null
            ? 'cursor-pointer text-aws-sea-blue-light dark:text-aws-sea-blue-dark hover:text-aws-sea-blue-hover-light dark:hover:text-aws-sea-blue-hover-dark'
            : 'cursor-not-allowed text-gray'
        )}
        onClick={() => {
          if (props.relatedDocument != null) {
            setRelatedDocument(props.linkId, props.relatedDocument);
          }
        }}>
        {props.children}
      </a>

      {relatedDocuments[props.linkId] && (
        <RelatedDocumentViewer
          relatedDocument={relatedDocuments[props.linkId]}
          onClick={() => {
            resetRelatedDocument(props.linkId);
          }}
        />
      )}
    </>
  );
};

const ChatMessageMarkdown: React.FC<Props> = ({
  className,
  children,
  isStreaming,
  relatedDocuments,
  messageId,
}) => {
  const { t } = useTranslation();
  const sourceIds = useMemo(() => (
    [...new Set(Array.from(
      children.matchAll(/\[\^(?<sourceId>[\w!?/+\-_~=;.,*&@#$%]+?)\]/g),
      match => match.groups!.sourceId,
    ))]
  ), [children]);

  const chatWaitingSymbol = useMemo(() => t('app.chatWaitingSymbol'), [t]);
  const text = useMemo(() => {
    const textRemovedIncompleteCitation = children.replace(/\[\^[^\]]*?$/, '[^');
    let textReplacedSourceId = textRemovedIncompleteCitation.replace(
      /\[\^(?<sourceId>[\w!?/+\-_~=;.,*&@#$%]+?)\]/g,
      (_, sourceId) => {
        const index = sourceIds.indexOf(sourceId);
        if (index === -1) {
          return '';
        }
        return `[^${index + 1}]`
      },
    );

    // Note: We no longer escape single $ here because remark-math is configured
    // to only recognize $$ for display math (singleDollarTextMath: false)
    // This prevents conflicts with code containing $ (like PHP variables, shell scripts, etc.)

    if (isStreaming) {
      textReplacedSourceId += chatWaitingSymbol;
    }

    // Default Footnote link is not shown, so set dummy
    if (sourceIds.length > 0) {
      textReplacedSourceId += `\n${sourceIds.map((_, index) => `[^${index + 1}]: dummy`).join('\n')}`;
    }

    return textReplacedSourceId;
  }, [children, isStreaming, sourceIds, chatWaitingSymbol]);

  type RemarkPlugins = Exclude<MarkdownOptions['remarkPlugins'], null | undefined>
  const remarkPlugins = useMemo((): RemarkPlugins => [
    remarkGfm,
    remarkBreaks,
    remarkMath,
  ], []);

  type RehypePlugins = Exclude<MarkdownOptions['rehypePlugins'], null | undefined>
  const rehypePlugins = useMemo((): RehypePlugins => [
    rehypeKatex,
    [
      rehypeExternalLinks, {
        target: '_blank',
        properties: { style: 'word-break: break-word;' },
      } as const satisfies RehypeExternalLinksOptions,
    ],
  ], []);

  const rehypeAsyncPlugins = useMemo((): RehypePlugins => [
    ...rehypePlugins,
    [
      rehypeMermaid, {
        errorFallback: (_element, diagram, error) => (
          {
            type: "element",
            tagName: "pre",
            properties: {
              className: "p-3 space-y-1",
            },
            children: [
              {
                type: "element",
                tagName: "div",
                properties: {
                  className: "p-2 bg-[#1e1e1e] font-[Menlo, Monaco, Consolas, \"Andale Mono\", \"Ubuntu Mono\", \"Courier New\", monospace] text-[13px] text-[#d4d4d4] leading-[1.3] whitespace-pre-wrap break-all",
                },
                children: [
                  {
                    type: "text",
                    value: diagram,
                  },
                ],
              },
              {
                type: "element",
                tagName: 'div',
                properties: {
                  className: "text-sm font-bold text-red",
                },
                children: [
                  {
                    type: "text",
                    value: t("error.invalidMermaidFormat"),
                  },
                ],
              },
              {
                type: "element",
                tagName: "div",
                properties: {
                  className: "p-2 border text-sm rounded-sm text-red/80",
                },
                children: [
                  {
                    type: "text",
                    value: `${error}`,
                  },
                ],
              },
            ],
          }
        ),
      } as const satisfies RehypeMermaidOptions,
    ],
  ], [rehypePlugins, t]);

  type Components = Exclude<MarkdownOptions['components'], null | undefined>
  type CodeComponent = Exclude<Components['code'], keyof JSX.IntrinsicElements | undefined>;
  const Code = useCallback<CodeComponent>(function ({ node: _node, className, children, ref: _ref, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeText = onlyText(children).replace(/\n$/, '');

    return match ? (
      <CopyToClipboard codeText={codeText}>
        <SyntaxHighlighter
          {...props}
          children={codeText}
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          wrapLongLines={true}
          customStyle={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%'
          }}
          className="code-block-wrap"
        />
      </CopyToClipboard>
    ) : (
      <code {...props} className={className}>
        {children}
      </code>
    );
  }, []);

  type SupComponent = Exclude<Components['sup'], keyof JSX.IntrinsicElements | undefined>;
  const Sup = useCallback<SupComponent>(function ({ className, children }) {
    // Footnote's Link is replaced with a component that displays the Reference document
    return (
      <sup className={className}>
        {
          React.Children.map(children, (child, idx) => {
            if (child != null && typeof child === 'object' && 'props' in child && child.props['data-footnote-ref']) {
              const href: string = child.props.href ?? '';
              if (/#user-content-fn-[\d]+/.test(href ?? '')) {
                const docNo = Number.parseInt(
                  href.replace('#user-content-fn-', '')
                );
                const sourceId = sourceIds[docNo - 1];
                const relatedDocument = relatedDocuments?.find(document => (
                  document.sourceId === sourceId || document.sourceId === `${messageId}@${sourceId}`
                ));

                const refNo = child.props.children[0];
                return (
                  <RelatedDocumentLink
                    key={`${idx}-${docNo}`}
                    linkId={`${messageId}-${idx}-${docNo}`}
                    relatedDocument={relatedDocument}
                    sourceId={sourceId}
                  >
                    [{refNo}]
                  </RelatedDocumentLink>
                );
              }
            }
            return child;
          })
        }
      </sup>
    );
  }, [messageId, relatedDocuments, sourceIds]);

  type SectionComponent = Exclude<Components['section'], keyof JSX.IntrinsicElements | undefined>;
  const Section = useCallback<SectionComponent>(function ({ className, children, ...props }) {
    // Normal Footnote not shown for RAG reference documents
    if ('data-footnotes' in props && props['data-footnotes']) {
      return null;
    } else {
      return <section className={className}>{children}</section>;
    }
  }, []);

  const components = useMemo((): Components => ({
    code: Code,
    sup: Sup,
    section: Section,
  }), [Code, Sup, Section]);

  return (
    <div className={twMerge(className, 'prose dark:prose-invert w-full wrap-break-word')}>
      {isStreaming ? (
        <Markdown
          children={text}
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={components}
        />
      ) : (
        <MarkdownHooks
          children={text}
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypeAsyncPlugins}
          components={components}
          fallback={
            <Markdown
              children={text}
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={components}
            />
          }
        />
      )}
    </div>
  );
};

const CopyToClipboard = ({
  children,
  codeText,
}: {
  children: React.ReactNode;
  codeText: string;
}) => {
  return (
    <div className="relative max-w-full overflow-hidden">
      {children}
      <div className="absolute right-2 top-2 flex gap-0">
        <ButtonDownload text={codeText} />
        <ButtonCopy text={codeText} />
      </div>
    </div>
  );
};

export default ChatMessageMarkdown;
