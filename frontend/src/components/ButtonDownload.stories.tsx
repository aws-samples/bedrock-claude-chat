import type { Meta } from '@storybook/react-vite';
import ButtonDownload from './ButtonDownload';

export default { component: ButtonDownload } satisfies Meta<
  typeof ButtonDownload
>;

export const Ideal = () => <ButtonDownload text={'DownloadText'} />;
