import React from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { useTranslation } from 'react-i18next';

type PromptSampleProps = {
  title: string;
  prompt: string;
};

const PromptSample: React.FC<PromptSampleProps> = (props) => {
  return (
    <div>
      <div>{props.title}</div>
      <div className="bg-light-gray rounded p-2 text-aws-font-color">
        {props.prompt.split('\n').map((s, idx) => (
          <div key={idx}>{s}</div>
        ))}
      </div>
    </div>
  );
};

type Props = BaseProps & {
  isOpen: boolean;
  onClose: () => void;
};

const DialogInstructionsSamples: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <ModalDialog
      {...props}
      title={t('bot.samples.title')}
      widthFromContent
      className="w-2/3">
      <div>
        <div className="flex flex-col gap-3">
          <PromptSample
            title={t('bot.samples.pythonCodeAssistant.title')}
            prompt={t('bot.samples.pythonCodeAssistant.prompt')}
          />
          <PromptSample
            title={t('bot.samples.mailCategorizer.title')}
            prompt={t('bot.samples.mailCategorizer.prompt')}
          />

          <PromptSample
            title={t('bot.samples.fitnessCoach.title')}
            prompt={t('bot.samples.fitnessCoach.prompt')}
          />
        </div>

        <div className="mt-2 text-xs">{t('bot.samples.reference')}</div>
        <div className="mt-1 flex justify-end gap-2">
          <Button onClick={props.onClose} className="p-2" outlined>
            {t('button.close')}
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
};

export default DialogInstructionsSamples;
