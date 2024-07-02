import { useTranslation } from 'react-i18next';
import { DEFAULT_EMBEDDING_CONFIG, EDGE_EMBEDDING_PARAMS } from '../constants';
import { Slider } from './Slider';
import { useState } from 'react';
import { EmdeddingParams } from '../@types/bot';

export const Ideal = () => {
  const { t } = useTranslation();
  const [embeddingParams, setEmbeddingParams] = useState<EmdeddingParams>({
    chunkSize: DEFAULT_EMBEDDING_CONFIG.chunkSize,
    chunkOverlap: DEFAULT_EMBEDDING_CONFIG.chunkOverlap,
    enablePartitionPdf: DEFAULT_EMBEDDING_CONFIG.enablePartitionPdf,
  });
  return (
    <Slider
      value={embeddingParams.chunkSize}
      hint={t('generationConfig.maxTokens.hint')}
      label={t('generationConfig.maxTokens.label')}
      range={{
        min: EDGE_EMBEDDING_PARAMS.chunkSize.MIN,
        max: EDGE_EMBEDDING_PARAMS.chunkSize.MAX,
        step: EDGE_EMBEDDING_PARAMS.chunkSize.STEP,
      }}
      onChange={(chunkSize) =>
        setEmbeddingParams((params) => ({
          ...params,
          chunkSize: chunkSize,
        }))
      }
    />
  );
};

export const Error = () => {
  const { t } = useTranslation();
  const [embeddingParams, setEmbeddingParams] = useState<EmdeddingParams>({
    chunkSize: DEFAULT_EMBEDDING_CONFIG.chunkSize,
    chunkOverlap: DEFAULT_EMBEDDING_CONFIG.chunkOverlap,
    enablePartitionPdf: DEFAULT_EMBEDDING_CONFIG.enablePartitionPdf,
  });
  return (
    <Slider
      value={embeddingParams.chunkSize}
      hint={t('generationConfig.maxTokens.hint')}
      label={t('generationConfig.maxTokens.label')}
      range={{
        min: EDGE_EMBEDDING_PARAMS.chunkSize.MIN,
        max: EDGE_EMBEDDING_PARAMS.chunkSize.MAX,
        step: EDGE_EMBEDDING_PARAMS.chunkSize.STEP,
      }}
      onChange={(chunkSize) =>
        setEmbeddingParams((params) => ({
          ...params,
          chunkSize: chunkSize,
        }))
      }
      errorMessage="error"
    />
  );
};
