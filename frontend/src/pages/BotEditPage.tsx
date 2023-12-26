import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputText from '../components/InputText';
import Button from '../components/Button';
import useBot from '../hooks/useBot';
import { useNavigate, useParams } from 'react-router-dom';
import { PiCaretLeft, PiNote, PiPlus, PiTrash } from 'react-icons/pi';
import Textarea from '../components/Textarea';
import DialogInstructionsSamples from '../components/DialogInstructionsSamples';
import ButtonIcon from '../components/ButtonIcon';
import { produce } from 'immer';
import Alert from '../components/Alert';
import KnowledgeFileUploader from '../components/KnowledgeFileUploader';
import { BotFile } from '../@types/bot';

const BotEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { botId } = useParams();
  const { getMyBot, registerBot, updateBot } = useBot();

  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [sitemaps, setSitemaps] = useState<string[]>(['']);
  const [files, setFiles] = useState<BotFile[]>([]);

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (botId) {
      setIsLoading(true);
      getMyBot(botId)
        .then((bot) => {
          setTitle(bot.title);
          setDescription(bot.description);
          setInstruction(bot.instruction);
          setUrls(
            bot.knowledge.sourceUrls.length === 0
              ? ['']
              : bot.knowledge.sourceUrls
          );
          setSitemaps(
            bot.knowledge.sitemapUrls.length === 0
              ? ['']
              : bot.knowledge.sitemapUrls
          );
          if (bot.syncStatus === 'FAILED') {
            setErrorMessage(bot.syncStatusReason);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  const onChangeUrl = useCallback(
    (url: string, idx: number) => {
      setUrls(
        produce(urls, (draft) => {
          draft[idx] = url;
        })
      );
    },
    [urls]
  );

  const onClickAddUrl = useCallback(() => {
    setUrls([...urls, '']);
  }, [urls]);

  const onClickRemoveUrl = useCallback(
    (idx: number) => {
      setUrls(
        produce(urls, (draft) => {
          draft.splice(idx, 1);
          if (draft.length === 0) {
            draft.push('');
          }
          return;
        })
      );
    },
    [urls]
  );

  const onChangeSitemap = useCallback(
    (url: string, idx: number) => {
      setSitemaps(
        produce(sitemaps, (draft) => {
          draft[idx] = url;
        })
      );
    },
    [sitemaps]
  );

  const onClickAddSitemap = useCallback(() => {
    setSitemaps([...sitemaps, '']);
  }, [sitemaps]);

  const onClickRemoveSitemap = useCallback(
    (idx: number) => {
      setSitemaps(
        produce(sitemaps, (draft) => {
          draft.splice(idx, 1);
          if (draft.length === 0) {
            draft.push('');
          }
          return;
        })
      );
    },
    [sitemaps]
  );

  const onClickBack = useCallback(() => {
    history.back();
  }, []);

  const onClickCreate = useCallback(() => {
    setIsLoading(true);
    registerBot({
      title,
      description,
      instruction,
      knowledge: {
        sourceUrls: urls.filter((s) => s !== ''),
        sitemapUrls: sitemaps.filter((s) => s !== ''),
        filenames: [],
      },
    })
      .then(() => {
        navigate('/bot/explore');
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [description, instruction, navigate, registerBot, sitemaps, title, urls]);

  const onClickEdit = useCallback(() => {
    if (botId) {
      setIsLoading(true);
      updateBot(botId, {
        title,
        description,
        instruction,
        knowledge: {
          sourceUrls: urls.filter((s) => s !== ''),
          sitemapUrls: sitemaps.filter((s) => s !== ''),
          filenames: [],
        },
      })
        .then(() => {
          navigate('/bot/explore');
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [
    botId,
    description,
    instruction,
    navigate,
    sitemaps,
    title,
    updateBot,
    urls,
  ]);

  const [isOpenSamples, setIsOpenSamples] = useState(false);

  const disabledRegister = useMemo(() => {
    return title === '' || files.findIndex((f) => f.status !== 'UPLOADED') > -1;
  }, [files, title]);

  return (
    <>
      <DialogInstructionsSamples
        isOpen={isOpenSamples}
        onClose={() => {
          setIsOpenSamples(false);
        }}
      />
      <div className="mb-20 flex justify-center">
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
                hint={t('input.hint.required')}
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
                <div className="flex items-center gap-1">
                  <div className="text-lg font-bold">
                    {t('bot.label.knowledge')}
                  </div>
                </div>

                <div className="text-sm text-aws-font-color/50">
                  {t('bot.help.knowledge.overview')}
                </div>

                {errorMessage !== '' && (
                  <Alert
                    className="mt-2"
                    severity="error"
                    title={t('bot.alert.sync.error.title')}>
                    <>
                      <div className="mb-1 text-sm text-dark-gray">
                        {t('bot.alert.sync.error.body')}
                      </div>
                      <div className="rounded border bg-light-gray p-2 text-dark-gray">
                        {errorMessage}
                      </div>
                    </>
                  </Alert>
                )}

                <div className="mt-2">
                  <div className="font-semibold">{t('bot.label.url')}</div>
                  <div className="text-sm text-aws-font-color/50">
                    {t('bot.help.knowledge.url')}
                  </div>
                  <div className="mt-2 flex w-full flex-col gap-1">
                    {urls.map((url, idx) => (
                      <div className="flex w-full gap-2" key={idx}>
                        <InputText
                          className="w-full"
                          type="url"
                          disabled={isLoading}
                          value={url}
                          onChange={(s) => {
                            onChangeUrl(s, idx);
                          }}
                        />
                        <ButtonIcon
                          className="text-red"
                          onClick={() => {
                            onClickRemoveUrl(idx);
                          }}>
                          <PiTrash />
                        </ButtonIcon>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Button outlined icon={<PiPlus />} onClick={onClickAddUrl}>
                      {t('button.add')}
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="font-semibold">{t('bot.label.sitemap')}</div>
                  <div className="text-sm text-aws-font-color/50">
                    {t('bot.help.knowledge.sitemap')}
                  </div>
                  <div className="mt-2 flex w-full flex-col gap-1">
                    {sitemaps.map((sitemap, idx) => (
                      <div className="flex w-full gap-2" key={idx}>
                        <InputText
                          className="w-full"
                          type="url"
                          disabled={isLoading}
                          value={sitemap}
                          onChange={(s) => {
                            onChangeSitemap(s, idx);
                          }}
                        />
                        <ButtonIcon
                          className="text-red"
                          onClick={() => {
                            onClickRemoveSitemap(idx);
                          }}>
                          <PiTrash />
                        </ButtonIcon>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Button
                      outlined
                      icon={<PiPlus />}
                      onClick={onClickAddSitemap}>
                      {t('button.add')}
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="font-semibold">{t('bot.label.file')}</div>
                  <div className="text-sm text-aws-font-color/50">
                    {t('bot.help.knowledge.file')}
                  </div>
                  <div className="mt-2 flex w-full flex-col gap-1">
                    <KnowledgeFileUploader
                      className="h-48"
                      botId={botId ?? ''}
                      files={files}
                      onChange={setFiles}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button outlined icon={<PiCaretLeft />} onClick={onClickBack}>
                  {t('button.back')}
                </Button>

                {botId ? (
                  <Button
                    onClick={onClickEdit}
                    loading={isLoading}
                    disabled={disabledRegister}>
                    {t('bot.button.edit')}
                  </Button>
                ) : (
                  <Button
                    onClick={onClickCreate}
                    loading={isLoading}
                    disabled={disabledRegister}>
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
