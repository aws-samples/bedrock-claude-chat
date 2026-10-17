import { BaseProps } from '../@types/common';
import useModel from '../hooks/useModel';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react/jsx-runtime';
import { useMemo, useEffect } from 'react';
import { PiCaretDown, PiCheck } from 'react-icons/pi';
import { ActiveModels } from '../@types/bot';
import { toCamelCase } from '../utils/StringUtils';

interface Props extends BaseProps {
  activeModels: ActiveModels;
  botId?: string | null;
}

const SwitchBedrockModel: React.FC<Props> = (props) => {
  const {
    availableModels: allModels,
    modelId,
    setModelId,
    getDefaultModel,
  } = useModel(props.botId, props.activeModels);

  const availableModels = useMemo(() => {
    return allModels.filter((model) => {
      if (props.activeModels) {
        return (
          props.activeModels[
            toCamelCase(model.modelId) as keyof ActiveModels
          ] === true
        );
      }
      return true;
    });
  }, [allModels, props.activeModels]);

  // Automatically switch to the default model if the current model is not available
  useEffect(() => {
    const isCurrentModelAvailable = availableModels.some(
      (model) => model.modelId === modelId
    );

    if (!isCurrentModelAvailable && availableModels.length > 0) {
      const defaultModelId = getDefaultModel();
      if (defaultModelId && defaultModelId !== modelId) {
        setModelId(defaultModelId);
      }
    }
  }, [availableModels, modelId, setModelId, getDefaultModel]);

  const modelName = useMemo(() => {
    const foundModel = availableModels.find((model) => model.modelId === modelId);
    if (foundModel) {
      return foundModel.label;
    }
    // Only call getDefaultModel if current model is not found
    const defaultModelId = getDefaultModel();
    if (defaultModelId) {
      const defaultModel = availableModels.find((model) => model.modelId === defaultModelId);
      return defaultModel?.label ?? '';
    }
    return '';
  }, [availableModels, modelId, getDefaultModel]);

  return (
    <div className="">
      <Popover className="relative">
        {() => (
          <>
            <Popover.Button
              className={`${
                props.className ?? ''
              } group inline-flex w-auto whitespace-nowrap rounded-sm border-aws-squid-ink-light/50 dark:border-aws-squid-ink-dark/50 bg-aws-paper-light dark:bg-aws-paper-dark p-2 px-3 text-base hover:brightness-75`}>
              <div className="flex items-center justify-between text-xl font-bold text-dark-gray dark:text-light-gray">
                <span>{modelName}</span>
                <PiCaretDown className="ml-2" />
              </div>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1">
              <Popover.Panel className="absolute left-0 top-14 z-10 w-96">
                <div className="mt-0.5 overflow-hidden shadow-lg">
                  <div className="flex flex-col whitespace-nowrap rounded-sm border border-aws-font-color-light/50 dark:border-aws-font-color-dark/50 bg-white dark:bg-aws-ui-color-dark text-sm max-h-80 overflow-y-auto">
                    {availableModels.map((model) => (
                      <div
                        key={model.modelId}
                        className="m-1 flex cursor-pointer rounded-sm p-1 px-2 hover:bg-light-gray dark:hover:bg-aws-paper-dark"
                        onClick={() => {
                          setModelId(model.modelId);
                        }}>
                        <div className="mr-3 flex flex-col items-center justify-center">
                          <PiCheck
                            className={
                              model.modelId === modelId
                                ? ''
                                : 'text-transparent'
                            }
                          />
                        </div>
                        <div>
                          <div className="block text-left font-semibold">
                            <span>{model.label}</span>
                          </div>
                          {model.description && (
                            <div className="block whitespace-normal text-left text-xs text-dark-gray dark:text-aws-font-color-dark">
                              <span>{model.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default SwitchBedrockModel;
