import { useSyncExternalStore } from 'react';
import { Info } from 'lucide-react';
import { isDemoMode, subscribeDemoMode } from '../utils/demoMode.js';

// Shown while the UI is displaying the bundled sample catalogue.
export default function DemoBanner() {
  const demo = useSyncExternalStore(subscribeDemoMode, isDemoMode);
  if (!demo) return null;

  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50">
      <div className="container-page flex items-center gap-2 py-2 text-xs text-amber-800 sm:text-sm">
        <Info size={16} className="flex-shrink-0" />
        <p>
          <span className="font-semibold">Preview mode:</span> the backend isn&apos;t running, so you&apos;re seeing
          sample accounts. Login, saved carts and checkout need the server.
        </p>
      </div>
    </div>
  );
}
