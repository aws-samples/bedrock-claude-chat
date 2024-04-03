import { FC, Dispatch } from 'react';

interface Props {
  title: string;
  value: number;
  description: string;
  range: {
    min: number;
    max: number;
    div: number;
  };
  onChange: Dispatch<number>;
}

export const Slider: FC<Props> = ({
  title,
  value,
  description,
  range,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {title}
      </label>
      <span className="text-[12px] text-sm text-black/50">{description}</span>
      <span className="mb-1 mt-2 text-center text-neutral-900 dark:text-neutral-500">
        {value}
      </span>
      <input
        className="cursor-pointer"
        type="range"
        min={range.min}
        max={range.max}
        step={range.div}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};
