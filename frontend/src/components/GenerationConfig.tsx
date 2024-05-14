import React from 'react';
import { useTranslation } from 'react-i18next';
import InputText from './InputText';
import { Slider } from './Slider';
import Help from '../components/Help';
import {
  EDGE_GENERATION_PARAMS,
  EDGE_MISTRAL_GENERATION_PARAMS
} from '../constants';

const generationConfigParam =
  import.meta.env.VITE_APP_ENABLE_MISTRAL === 'true' ?
    EDGE_MISTRAL_GENERATION_PARAMS :
    EDGE_GENERATION_PARAMS;

interface GenerationConfigProps {
  topK: number;
  setTopK: React.Dispatch<React.SetStateAction<number>>;
  topP: number;
  setTopP: React.Dispatch<React.SetStateAction<number>>;
  maxTokens: number;
  setMaxTokens: React.Dispatch<React.SetStateAction<number>>;
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
  stopSequences: string;
  setStopSequences: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  errorMessages: { [label: string]: string }
}

const GenerationConfig: React.FC<GenerationConfigProps> = ({
  isLoading,
  errorMessages,
  ...props
}) => {
  const { t } = useTranslation();
  return (<div>
    <div className="text-sm text-aws-font-color/50">
      {t('generationConfig.description')}
    </div>
    <div className="mt-2">
      <Slider
        value={props.maxTokens}
        hint={t('generationConfig.maxTokens.hint')}
        label={t('generationConfig.maxTokens.label')}
        range={{
          min: generationConfigParam.maxTokens.MIN,
          max: generationConfigParam.maxTokens.MAX,
          step: generationConfigParam.maxTokens.STEP,
        }}
        onChange={props.setMaxTokens}
        errorMessage={errorMessages['maxTokens']}
      />
    </div>
    <div className="mt-2">
      <Slider
        value={props.temperature}
        enableDecimal
        hint={t('generationConfig.temperature.hint')}
        label={
          <div className="flex items-center gap-1">
            {t('generationConfig.temperature.label')}
            <Help
              direction="right"
              message={t('generationConfig.temperature.help')}
            />
          </div>
        }
        range={{
          min: generationConfigParam.temperature.MIN,
          max: generationConfigParam.temperature.MAX,
          step: generationConfigParam.temperature.STEP,
        }}
        onChange={props.setTemperature}
        errorMessage={errorMessages['temperature']}
      />
    </div>
    <div className="mt-2">
      <Slider
        value={props.topK}
        hint={t('generationConfig.topK.hint')}
        label={
          <div className="flex items-center gap-1">
            {t('generationConfig.topK.label')}
            <Help
              direction="right"
              message={t('generationConfig.topK.help')}
            />
          </div>
        }
        range={{
          min: generationConfigParam.topK.MIN,
          max: generationConfigParam.topK.MAX,
          step: generationConfigParam.topK.STEP,
        }}
        onChange={props.setTopK}
        errorMessage={errorMessages['topK']}
      />
    </div>
    <div className="mt-2">
      <Slider
        value={props.topP}
        enableDecimal
        hint={t('generationConfig.topP.hint')}
        label={
          <div className="flex items-center gap-1">
            {t('generationConfig.topP.label')}
            <Help
              direction="right"
              message={t('generationConfig.topP.help')}
            />
          </div>
        }
        range={{
          min: generationConfigParam.topP.MIN,
          max: generationConfigParam.topP.MAX,
          step: generationConfigParam.topP.STEP,
        }}
        onChange={props.setTopP}
        errorMessage={errorMessages['topP']}
      />
    </div>
    <div className="mt-2">
      <InputText
        label={t('generationConfig.stopSequences.label')}
        disabled={isLoading}
        value={props.stopSequences}
        onChange={props.setStopSequences}
        hint={t('generationConfig.stopSequences.hint')}
        errorMessage={errorMessages['stopSequences']}
      />
    </div>
  </div>);
}

export default GenerationConfig;