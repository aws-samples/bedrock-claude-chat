import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { JSONTree } from 'react-json-tree';

import { RelatedDocument } from '../@types/conversation';
import { getAgentName } from '../features/agent/functions/formatDescription';

const RelatedDocumentViewer: React.FC<{
  relatedDocument: Omit<RelatedDocument, 'sourceId'>;
  onClick: () => void;
}> = (props) => {
  const { t } = useTranslation();

  const content = useMemo(() => (
    props.relatedDocument.content
  ), [props.relatedDocument.content]);

  const sourceName = useMemo(() => {
    if (!props.relatedDocument.sourceName) {return undefined;}
    if (props.relatedDocument.pageNumber) {
      return `${props.relatedDocument.sourceName} (p.${props.relatedDocument.pageNumber})`;
    }
    return props.relatedDocument.sourceName;
  }, [props.relatedDocument.sourceName, props.relatedDocument.pageNumber]);

  const sourceLink = useMemo(() => {
    if (!props.relatedDocument.sourceLink) {return undefined;}
    if (props.relatedDocument.pageNumber) {
      return `${props.relatedDocument.sourceLink}#page=${props.relatedDocument.pageNumber}`;
    }
    return props.relatedDocument.sourceLink;
  }, [props.relatedDocument.sourceLink, props.relatedDocument.pageNumber]);

  return (
    <div
      className="fixed left-0 top-0 z-50 flex h-dvh w-dvw items-center justify-center bg-aws-squid-ink-light/20 dark:bg-aws-squid-ink-dark/20 transition duration-1000"
      onClick={props.onClick}>
      <div
        className="max-h-[80vh] w-[70vw] max-w-200 overflow-y-auto rounded-sm border bg-aws-squid-ink-light dark:bg-aws-squid-ink-dark p-1 text-sm text-aws-font-color-white-light dark:text-aws-font-color-white-dark"
        onClick={(e) => {
          e.stopPropagation();
        }}>
        {'text' in content && (
          content.text.split('\n').map((s, idx) => (
            <div key={idx}>{s}</div>
          ))
        )}
        {'json' in content && (
          <JSONTree
            data={content.json}
            invertTheme={false} // disable dark theme
          />
        )}

        {(sourceName || sourceLink) && (
          <div className="my-1 border-t pt-1 italic">
            {t('bot.label.referenceLink')}:
            {sourceLink ? (
              <span
                className="ml-1 cursor-pointer underline"
                onClick={() => {
                  window.open(sourceLink, '_blank');
                }}>
                {sourceName ? getAgentName(sourceName, t) : sourceLink}
              </span>
            ) : (
              <span className="ml-1">
                {getAgentName(sourceName!, t)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedDocumentViewer;
