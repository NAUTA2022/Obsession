import React from 'react';

export type AudioPlayerProps = React.AudioHTMLAttributes<HTMLAudioElement> & {
  src: string;
};

export default function AudioPlayer({ src, className, ...rest }: AudioPlayerProps) {
  return (
    <audio
      controls
      src={src}
      className={
        'h-11 w-full rounded-full bg-white/90 p-1 text-black shadow-lg backdrop-blur ' +
        (className ?? '')
      }
      {...rest}
    />
  );
}


