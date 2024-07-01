import React, { ReactNode, useMemo } from 'react';
import { BaseProps } from '../@types/common';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ButtonCopy from './ButtonCopy';
import { RelatedDocument } from '../@types/conversation';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { produce } from 'immer';
import rehypeExternalLinks, { Options } from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { onlyText } from 'react-children-utilities';

type Props = BaseProps & {
  children: string;
  relatedDocuments?: RelatedDocument[];
  messageId: string;
};

const useMarkdownState = create<{
  isOpenReference: {
    [key: string]: boolean;
  };
  setIsOpenReference: (key: string, b: boolean) => void;
}>((set, get) => ({
  isOpenReference: {},
  setIsOpenReference: (key, b) => {
    set({
      isOpenReference: produce(get().isOpenReference, (draft) => {
        draft[key] = b;
      }),
    });
  },
}));

const RelatedDocumentLink: React.FC<{
  relatedDocument?: RelatedDocument;
  linkId: string;
  children: ReactNode;
}> = (props) => {
  const { t } = useTranslation();
  const { isOpenReference, setIsOpenReference } = useMarkdownState();

  const linkUrl = useMemo(() => {
    const url = props.relatedDocument?.sourceLink;
    if (url) {
      if (props.relatedDocument?.contentType === 's3') {
        return decodeURIComponent(url.split('?')[0].split('/').pop() ?? '');
      } else {
        return url;
      }
    }
    return '';
  }, [props.relatedDocument?.contentType, props.relatedDocument?.sourceLink]);

  return (
    <>
      <a
        className={twMerge(
          'mx-0.5 ',
          props.relatedDocument
            ? 'cursor-pointer text-aws-sea-blue hover:text-aws-sea-blue-hover'
            : 'cursor-not-allowed text-gray'
        )}
        onClick={() => {
          setIsOpenReference(props.linkId, !isOpenReference[props.linkId]);
        }}>
        {props.children}
      </a>

      {props.relatedDocument && (
        <div
          className={twMerge(
            isOpenReference[props.linkId] ? 'visible' : 'invisible',
            'fixed left-0 top-0 z-50 flex h-dvh w-dvw items-center justify-center bg-aws-squid-ink/20 transition duration-1000'
          )}
          onClick={() => {
            setIsOpenReference(props.linkId, false);
          }}>
          <div
            className="max-h-[80vh] w-[70vw] max-w-[800px] overflow-y-auto rounded border bg-aws-squid-ink p-1 text-sm text-aws-font-color-white"
            onClick={(e) => {
              e.stopPropagation();
            }}>
            {props.relatedDocument.chunkBody.split('\n').map((s, idx) => (
              <div key={idx}>{s}</div>
            ))}

            <div className="my-1 border-t pt-1 italic">
              {t('bot.label.referenceLink')}:
              <span
                className="ml-1 cursor-pointer underline"
                onClick={() => {
                  window.open(props.relatedDocument?.sourceLink, '_blank');
                }}>
                {linkUrl}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ChatMessageMarkdown: React.FC<Props> = ({
  className,
  children,
  relatedDocuments,
  messageId,
}) => {
  const text = useMemo(() => {
    const results = children.match(/\[\^(?<number>[\d])+?\]/g);
    // Default Footnote link is not shown, so set dummy
    return results
      ? `${children}\n${results.map((result) => `${result}: dummy`).join('\n')}`
      : children;
  }, [children]);

  const remarkPlugins = useMemo(() => {
    return [remarkGfm, remarkBreaks, remarkMath];
  }, []);
  const rehypePlugins = useMemo(() => {
    const rehypeExternalLinksOptions: Options = {
      target: '_blank',
      properties: { style: 'word-break: break-all;' },
    };
    return [rehypeKatex, [rehypeExternalLinks, rehypeExternalLinksOptions]];
  }, []);

  return (
    <ReactMarkdown
      className={`${className ?? ''} prose max-w-full break-all`}
      children={text}
      remarkPlugins={remarkPlugins}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rehypePlugins={rehypePlugins}
      components={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeText = onlyText(children).replace(/\n$/, '');

          return !inline && match ? (
            <CopyToClipboard codeText={codeText}>
              <SyntaxHighlighter
                {...props}
                children={codeText}
                style={vscDarkPlus}
                language={match[1]}
                x
                PreTag="div"
                wrapLongLines={true}
              />
            </CopyToClipboard>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sup({ className, children }) {
          // Footnote's Link is replaced with a component that displays the Reference document
          return (
            <sup className={className}>
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                children.map((child, idx) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  if (child?.props['data-footnote-ref']) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const href: string = child.props.href ?? '';
                    if (/#user-content-fn-[\d]+/.test(href ?? '')) {
                      const docNo = Number.parseInt(
                        href.replace('#user-content-fn-', '')
                      );
                      const doc = relatedDocuments?.filter(
                        (doc) => doc.rank === docNo
                      )[0];

                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      const refNo = child.props.children[0];
                      return (
                        <RelatedDocumentLink
                          key={`${idx}-${docNo}`}
                          linkId={`${messageId}-${idx}-${docNo}`}
                          relatedDocument={doc}>
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
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        section({ className, children, ...props }) {
          // Normal Footnote not shown for RAG reference documents
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (props['data-footnotes']) {
            return null;
          } else {
            return <section className={className}>{children}</section>;
          }
        },
      }}
    />
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
    <div className="relative">
      {children}
      <ButtonCopy text={codeText} className="absolute right-2 top-2" />
    </div>
  );
};

export default ChatMessageMarkdown;
