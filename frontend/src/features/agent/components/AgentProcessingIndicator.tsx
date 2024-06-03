import Progress from '../../../components/Progress';
import { logisticCurve } from '../functions';

type Props = {
  processCount: number;
};

export const AgentProcessingIndicator = ({ processCount }: Props) => (
  <div className={` grid grid-cols-12 gap-2 p-3 `}>
    <div className="order-first col-span-12 flex items-center lg:order-none lg:col-span-8 lg:col-start-3">
      <div className="min-w-[2.3rem] max-w-[2.3rem]">
        <img src="/images/bedrock_icon_64.png" className="rounded" />
      </div>
      <div className="ml-5 grow">
        <Progress progress={logisticCurve(processCount) * 100} />
      </div>
    </div>
  </div>
);
