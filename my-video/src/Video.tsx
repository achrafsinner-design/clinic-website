import { Composition, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { style } from '@remotion/core';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontFamily: 'Arial, sans-serif',
};

const titleStyle: React.CSSProperties = {
  fontSize: '72px',
  fontWeight: 'bold',
  marginBottom: '20px',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '32px',
  opacity: 0.9,
};

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <div style={containerStyle}>
      <div style={{ ...titleStyle, opacity }}>
        Hello!
      </div>
      <div style={{ ...subtitleStyle, opacity }}>
        Remotion Video
      </div>
      <div style={{
        position: 'absolute',
        bottom: '60px',
        fontSize: '24px',
        opacity: interpolate(frame, [60, 90], [0, 1])
      }}>
        Created with FFmpeg + Remotion
      </div>
    </div>
  );
};

export const RemotionVideoComposition = (
  <Composition
    id="HelloWorld"
    component={RemotionVideo}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);
