import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { PiEyeLight, PiEyeSlashLight } from 'react-icons/pi';
import InputText from '../../../components/InputText';
import { Slider } from '../../../components/Slider';
import { FirecrawlConfig as FirecrawlConfigType } from '../types';
import { EDGE_FIRECRAWL_CONFIG } from '../constants';

type Props = {
  config: FirecrawlConfigType;
  onChange: (config: FirecrawlConfigType) => void;
};

export const FirecrawlConfig = ({ config, onChange }: Props) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      onChange({
        ...config,
        apiKey,
      });
    },
    [config, onChange]
  );

  const handleMaxResultsChange = useCallback(
    (maxResults: number) => {
      onChange({
        ...config,
        maxResults,
      });
    },
    [config, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <InputText
          className="flex-1"
          label={t('agent.tools.firecrawl.apiKey')}
          type={showPassword ? 'text' : 'password'}
          value={config.apiKey || ''}
          onChange={handleApiKeyChange}
        />
        <button
          type="button"
          className="size-9 rounded-sm border border-aws-font-color-light/50 p-2 text-sm dark:border-aws-font-color-dark/50"
          onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <PiEyeLight className="size-5" />
          ) : (
            <PiEyeSlashLight className="size-5" />
          )}
        </button>
      </div>
      <Slider
        label={t('agent.tools.firecrawl.maxResults')}
        value={config.maxResults}
        onChange={handleMaxResultsChange}
        range={{
          min: EDGE_FIRECRAWL_CONFIG.maxResults.MIN,
          max: EDGE_FIRECRAWL_CONFIG.maxResults.MAX,
          step: EDGE_FIRECRAWL_CONFIG.maxResults.STEP,
        }}
      />
    </div>
  );
};
