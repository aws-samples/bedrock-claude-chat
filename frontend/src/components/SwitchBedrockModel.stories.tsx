import type { Meta } from '@storybook/react-vite';
import SwitchBedrockModel from './SwitchBedrockModel';
import { Model } from '../@types/conversation';
import { AVAILABLE_MODEL_KEYS } from '../constants/index';
import { ActiveModels } from '../@types/bot';
import { toCamelCase } from '../utils/StringUtils';

export default { component: SwitchBedrockModel } satisfies Meta<
  typeof SwitchBedrockModel
>;

export const Ideal = () => (
  <SwitchBedrockModel
    activeModels={
      Object.fromEntries(
        AVAILABLE_MODEL_KEYS.map((key: Model) => [toCamelCase(key), true])
      ) as ActiveModels
    }
  />
);
