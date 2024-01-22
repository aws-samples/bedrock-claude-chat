import { FaBrain } from 'react-icons/fa';
import { AiFillThunderbolt } from 'react-icons/ai';
import { BaseProps } from '../@types/common';
import { Model } from '../@types/conversation';
import Button from './Button';

type Props = BaseProps & {
  model: Model;
  setModel: (model: Model) => void;
};

const SwitchBedrockModel: React.FC<Props> = (props) => {
  const buttonClass =
    'flex-1 w-40 flex items-center rounded-lg p-2 justify-center';

  return (
    <div
      className={`${
        props.className ?? ''
      } flex justify-center gap-2 rounded-lg border border-light-gray bg-light-gray p-1 text-sm`}>
      <Button
        className={`${buttonClass} ${
          props.model === 'claude-instant-v1'
            ? ''
            : 'border-light-gray bg-white text-dark-gray'
        }`}
        icon={<AiFillThunderbolt />}
        onClick={() => props.setModel('claude-instant-v1')}
        children={<span>Claude Instant</span>}></Button>
      <Button
        className={`${buttonClass} ${
          props.model === 'claude-v2'
            ? ''
            : 'border-light-gray bg-white text-dark-gray'
        }`}
        icon={<FaBrain />}
        onClick={() => props.setModel('claude-v2')}
        children={<span>Claude v2</span>}></Button>
    </div>
  );
};

export default SwitchBedrockModel;
