import LeftPanel from './LeftPanel.tsx';
import Stage from './Stage.tsx';
import PropertiesPanel from './PropertiesPanel.tsx';
import Timeline from './Timeline.tsx';

export default function Editor() {
  return (
    <div className="grid h-full grid-cols-[230px_1fr_290px] grid-rows-[1fr_190px] text-rp-ink">
      <LeftPanel />
      <Stage />
      <PropertiesPanel />
      <Timeline />
    </div>
  );
}
