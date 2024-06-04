import { useTranslation } from 'react-i18next';
import Progress from '../../../components/Progress';
import { logisticCurve } from '../functions/logisticCurve';

type Props = {
  processCount: number;
};

export const AgentProcessingIndicator = ({ processCount }: Props) => {
  const { t } = useTranslation();
  return (
    <div className={` grid grid-cols-12 gap-2 p-3 `}>
      <div className="order-first col-span-12 flex items-center lg:order-none lg:col-span-8 lg:col-start-3">
        <div className="min-w-[2.3rem] max-w-[2.3rem]">
          <img src="/images/bedrock_icon_64.png" className="rounded" />
        </div>
        <div className="ml-5 grow">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">
              {t('agent.progress.label')}
            </span>
            <Progress progress={logisticCurve(processCount) * 100} />
            <span className="whitespace-nowrap">
              {Math.round(logisticCurve(processCount) * 100)} %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
