import { useApp } from '../appStore.ts';
import Sidebar from './Sidebar.tsx';
import Topbar from './Topbar.tsx';
import Toast from './Toast.tsx';
import Dashboard from './views/Dashboard.tsx';
import Templates from './views/Templates.tsx';
import Consent from './views/Consent.tsx';
import Meeting from './views/Meeting.tsx';
import Editor from './Editor.tsx';
import Builder from './Builder.tsx';
import Publish from './views/Publish.tsx';
import AudioLayer from './AudioLayer.tsx';
import PlayerOverlay from './PlayerOverlay.tsx';

export default function AppShell() {
  const view = useApp((s) => s.view);
  const player = useApp((s) => s.player);
  const fullBleed = view === 'editor' || view === 'builder';

  return (
    <div className="grid h-screen grid-cols-[248px_1fr] overflow-hidden bg-rp-bg text-rp-ink">
      <Sidebar />
      <div className="flex flex-col overflow-hidden">
        <Topbar />
        <div className={fullBleed ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto p-7'}>
          {view === 'dashboard' && <Dashboard />}
          {view === 'templates' && <Templates />}
          {view === 'editor' && <Editor />}
          {view === 'builder' && <Builder />}
          {view === 'publish' && <Publish />}
          {view === 'consent' && <Consent />}
          {view === 'meeting' && <Meeting />}
        </div>
      </div>
      <Toast />
      {/* single audio engine for editor + player playback */}
      <AudioLayer />
      {player && <PlayerOverlay />}
    </div>
  );
}
