import useBedrockModel from '../hooks/useBedrockModel';
import { FaBrain } from 'react-icons/fa';
import { AiFillThunderbolt } from 'react-icons/ai';
import { BaseProps } from '../@types/common';

type Props = BaseProps & {
  isConversationStarted: boolean;
};

const BedrockModelSwitch: React.FC<Props> = (props) => {
  const { model, setModel } = useBedrockModel();

  const buttonClass =
    'flex-1 w-40 flex items-center rounded-lg p-2 justify-center';

  return props.isConversationStarted ? (
    <div className="text-sm text-gray-500">model: {model}</div>
  ) : (
    <div className="flex justify-center gap-2 rounded-lg border p-1">
      <button
        className={`${buttonClass} ${
          model === 'claude-instant-v1'
            ? 'bg-aws-squid-ink/100 text-white'
            : 'text-gray-500'
        }`}
        onClick={() => setModel('claude-instant-v1')}>
        <AiFillThunderbolt className="mr-1" />
        Claude Instant
      </button>
      <button
        className={`${buttonClass} ${
          model === 'claude-v2'
            ? 'bg-aws-squid-ink/100 text-white'
            : 'text-gray-500'
        }`}
        onClick={() => setModel('claude-v2')}>
        <FaBrain className="mr-2" />
        Claude v2
      </button>
    </div>
  );
};

export default BedrockModelSwitch;
