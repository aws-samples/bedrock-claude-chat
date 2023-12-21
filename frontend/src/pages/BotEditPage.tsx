import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputText from '../components/InputText';
import Button from '../components/Button';
import useBot from '../hooks/useBot';
import { useNavigate, useParams } from 'react-router-dom';
import { PiCaretLeft, PiNote, PiPlus, PiTrash } from 'react-icons/pi';
import Textarea from '../components/Textarea';
import DialogInstructionsSamples from '../components/DialogInstructionsSamples';
import ButtonIcon from '../components/ButtonIcon';

const BotEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { botId } = useParams();
  const { getMyBot, registerBot, updateBot } = useBot();

  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');

  useEffect(() => {
    if (botId) {
      setIsLoading(true);
      getMyBot(botId)
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

  const [isOpenSamples, setIsOpenSamples] = useState(false);

  return (
    <>
      <DialogInstructionsSamples
        isOpen={isOpenSamples}
        onClose={() => {
          setIsOpenSamples(false);
        }}
      />
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
              <div className="relative mt-3">
                <Button
                  className="absolute -top-3 right-0 text-xs"
                  outlined
                  onClick={() => {
                    setIsOpenSamples(true);
                  }}>
                  <PiNote className="mr-1" />
                  {t('bot.button.instructionsSamples')}
                </Button>
                <Textarea
                  label={t('bot.item.instruction')}
                  disabled={isLoading}
                  rows={5}
                  hint={t('bot.help.instructions')}
                  value={instruction}
                  onChange={setInstruction}
                />
              </div>

              <div className="mt-3">
                <div className="text-lg font-bold">
                  {t('bot.label.knowledge')}
                </div>
                <div className="text-sm text-aws-font-color/50">
                  {t('bot.help.knowledge.overview')}
                </div>

                <div className="mt-2">
                  <div className="font-semibold">URL</div>
                  <div className="text-sm text-aws-font-color/50">
                    {t('bot.help.knowledge.url')}
                  </div>
                  <div className="mt-2 w-full">
                    <div className="flex w-full gap-2">
                      <InputText
                        className="w-full"
                        type="url"
                        disabled={isLoading}
                        value={description}
                        onChange={setDescription}
                      />
                      <ButtonIcon className="text-red" onClick={() => {}}>
                        <PiTrash />
                      </ButtonIcon>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button outlined icon={<PiPlus />} onClick={() => {}}>
                      {t('button.add')}
                    </Button>
                  </div>
                </div>
              </div>

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
    </>
  );
};

export default BotEditPage;
