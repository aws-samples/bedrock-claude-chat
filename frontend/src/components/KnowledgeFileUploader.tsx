import React from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';
import useBotApi from '../hooks/useBotApi';

type Props = BaseProps & {
  botId: string;
};

const KnowledgeFileUploader: React.FC<Props> = (props) => {
  // const [file, setFile] = useState(null);

  const api = useBotApi();

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    // readFile(file);

    const presignUrl = await api.getPresignedUrl(props.botId, file.name);
    api.uploadFile(presignUrl.data.url, file);
  };

  // const readFile = (file) => {
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     setFile(e.target.result);
  //   };
  //   reader.readAsDataURL(file);
  // };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={twMerge(
        'h-full w-full rounded border bg-white',
        props.className
      )}>
      {/* {file && <img src={file} />} */}
    </div>
  );
};

export default KnowledgeFileUploader;
