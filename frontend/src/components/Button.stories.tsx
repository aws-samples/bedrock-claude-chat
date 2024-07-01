import { PiList } from 'react-icons/pi';
import Button from './Button';

export const Ideal = () => (
  <Button onClick={() => {}} className="px-20 text-xl">
    sample
  </Button>
);

export const Loading = () => (
  <Button loading onClick={() => {}} className="px-20 text-xl">
    sample
  </Button>
);

export const Text = () => (
  <Button onClick={() => {}} text className="px-20 text-xl">
    sample
  </Button>
);

export const Outlined = () => (
  <Button onClick={() => {}} outlined className="px-20 text-xl">
    sample
  </Button>
);

export const Disabled = () => (
  <Button onClick={() => {}} disabled className="px-20 text-xl">
    sample
  </Button>
);

export const Icon = () => (
  <Button onClick={() => {}} icon={<PiList />} className="px-20 text-xl">
    sample
  </Button>
);

export const RightIcon = () => (
  <Button onClick={() => {}} rightIcon={<PiList />} className="px-20 text-xl">
    sample
  </Button>
);
