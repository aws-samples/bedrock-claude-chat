import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputText from '../components/InputText';
import Button from '../components/Button';
import useBot from '../hooks/useBot';

const BotCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const { registerBot } = useBot();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');

  const onClickCreate = useCallback(() => {
    registerBot({
      title,
      description,
      instruction,
    });
  }, [description, instruction, registerBot, title]);

  return (
    <div className="flex justify-center">
      <div className="w-2/3">
        <div className="mt-5 w-full">
          <div className="text-xl font-bold">{t('bot.create.pageTitle')}</div>

          <div className="mt-3 flex flex-col gap-3">
            <InputText
              label={t('bot.item.title')}
              value={title}
              onChange={setTitle}
            />
            <InputText
              label={t('bot.item.description')}
              value={description}
              onChange={setDescription}
            />
            <InputText
              label={t('bot.item.instruction')}
              value={instruction}
              onChange={setInstruction}
            />

            <Button className="ml-auto mt-3 w-min" onClick={onClickCreate}>
              {t('bot.button.create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotCreatePage;
