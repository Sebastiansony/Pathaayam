import { CloudCheck, CloudOff, Loader2 } from 'lucide-react';
import type { SyncState } from '../../lib/api';

export default function SyncBadge({ state }: { state: SyncState }) {
  const map = {
    idle: { cls: 'bg-forest/5 text-forest/70 border-forest/15', icon: <CloudCheck className="h-3.5 w-3.5" />, text: 'Connected to Cloud' },
    synced: { cls: 'bg-lime/10 text-leaf border-lime/30', icon: <CloudCheck className="h-3.5 w-3.5" />, text: 'Synced with Cloud' },
    saving: { cls: 'bg-saffron/10 text-saffron border-saffron/30', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: 'Saving to Cloud…' },
    error: { cls: 'bg-chili/10 text-chili border-chili/30', icon: <CloudOff className="h-3.5 w-3.5" />, text: 'Sync Error' },
  }[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${map.cls}`}>
      <span className="relative flex h-2 w-2">
        {state !== 'error' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" />}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {map.icon}
      {map.text}
    </span>
  );
}
