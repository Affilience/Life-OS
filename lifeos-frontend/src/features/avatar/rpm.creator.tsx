/**
 * Ready Player Me Creator Component
 * Embeds RPM iframe and captures avatar creation events
 */

import React, { useEffect, useRef } from 'react';
import { RpmCreatorProps, RpmMessageEvent } from './rpm.types';

const RPM_CREATOR_URL = 'https://readyplayer.me/avatar?frameApi&quickStart=true';

export const RpmCreator: React.FC<RpmCreatorProps> = ({
  onAvatarReady,
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<RpmMessageEvent>) => {
      // Validate message origin
      if (event.origin !== 'https://readyplayer.me') {
        return;
      }

      const { eventName, data } = event.data;

      // Handle avatar export event
      if (eventName === 'v1.avatar.exported') {
        const url = data?.url;
        if (url && typeof url === 'string' && url.endsWith('.glb')) {
          console.log('Avatar created:', url);
          onAvatarReady(url);
        } else {
          console.warn('Invalid avatar URL received:', url);
        }
      }

      // Handle frame ready event (optional logging)
      if (eventName === 'v1.frame.ready') {
        console.log('RPM Creator ready');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onAvatarReady]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] bg-[#12101a] rounded-lg overflow-hidden shadow-2xl">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-[#1a1724] hover:bg-[#221e2e] text-white rounded-lg transition-colors"
            aria-label="Close avatar creator"
          >
            Close
          </button>
        )}

        {/* RPM iframe */}
        <iframe
          ref={iframeRef}
          src={RPM_CREATOR_URL}
          className="w-full h-full border-0"
          allow="camera *; microphone *"
          title="Ready Player Me Avatar Creator"
        />
      </div>
    </div>
  );
};
