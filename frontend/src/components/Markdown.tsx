import React from 'react';
import { BaseProps } from '../@types/common';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ButtonCopy from './ButtonCopy';

type Props = BaseProps & {
  children: string;
};

const Markdown: React.FC<Props> = ({ className, children }) => {
  return (
    <ReactMarkdown
      className={`${className ?? ''} prose max-w-full`}
      children={children}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        a({ children, href }) {
          if (href?.endsWith('.jpg') || href?.endsWith('.png') || href?.endsWith('.gif')) {
            return <img src={href} alt={String(children)} />;
          }
          return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeText = String(children).replace(/\n$/, '');

          return !inline && match ? (
            <CopyToClipboard codeText={codeText}>
              <SyntaxHighlighter
                {...props}
                children={codeText}
                style={vscDarkPlus}
                language={match[1]}
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

export default Markdown;
