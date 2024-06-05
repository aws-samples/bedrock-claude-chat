import { useTranslation } from 'react-i18next';
import Progress from '../../../components/Progress';
import { logisticCurve } from '../functions/logisticCurve';

type Props = {
  processCount: number;
};

export const AgentProcessingIndicator = ({ processCount }: Props) => {
  const { t } = useTranslation();
  const calc = processCount == 0 ? 0 : logisticCurve(processCount - 1) * 100;
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
            <Progress progress={calc} />
            <span className="whitespace-nowrap">{calc.toFixed(1)} %</span>
          </div>
        </div>
      </div>
    </div>
  );
};
