import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputText from '../components/InputText';
import Button from '../components/Button';
import useBot from '../hooks/useBot';
import { useNavigate, useParams } from 'react-router-dom';
import { PiCaretLeft } from 'react-icons/pi';
import Textarea from '../components/Textarea';

const BotEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { botId } = useParams();
  const { getBot, registerBot, updateBot } = useBot();

  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');

  useEffect(() => {
    if (botId) {
      setIsLoading(true);
      getBot(botId)
        .then((bot) => {
          setTitle(bot.title);
          setDescription(bot.description);
          setInstruction(bot.instruction);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  const onClickBack = useCallback(() => {
    history.back();
  }, []);

  const onClickCreate = useCallback(() => {
    setIsLoading(true);
    registerBot({
      title,
      description,
      instruction,
    })
      .then(() => {
        navigate('/bot/explore');
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [description, instruction, navigate, registerBot, title]);

  const onClickEdit = useCallback(() => {
    if (botId) {
      setIsLoading(true);
      updateBot(botId, {
        title,
        description,
        instruction,
      })
        .then(() => {
          navigate('/bot/explore');
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [botId, description, instruction, navigate, title, updateBot]);

  return (
    <div className="flex justify-center">
      <div className="w-2/3">
        <div className="mt-5 w-full">
          <div className="text-xl font-bold">
            {botId ? t('bot.edit.pageTitle') : t('bot.create.pageTitle')}
          </div>

          <div className="mt-3 flex flex-col gap-3">
            <InputText
              label={t('bot.item.title')}
              disabled={isLoading}
              value={title}
              onChange={setTitle}
            />
            <InputText
              label={t('bot.item.description')}
              disabled={isLoading}
              value={description}
              onChange={setDescription}
            />
            <Textarea
              label={t('bot.item.instruction')}
              disabled={isLoading}
              rows={5}
              value={instruction}
              onChange={setInstruction}
            />

            <div className="flex justify-between">
              <Button outlined icon={<PiCaretLeft />} onClick={onClickBack}>
                {t('button.back')}
              </Button>

              {botId ? (
                <Button onClick={onClickEdit} loading={isLoading}>
                  {t('bot.button.edit')}
                </Button>
              ) : (
                <Button onClick={onClickCreate} loading={isLoading}>
                  {t('bot.button.create')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotEditPage;
