import { useState } from 'react';
import Editor from './Editor.tsx';
import SaveTemplateModal from './SaveTemplateModal.tsx';

export default function Builder() {
  const [showSave, setShowSave] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between border-b border-rp-line bg-white px-4 py-[10px]">
        <div className="text-[12px] text-rp-mute">
          Build your layout, bundle assets into groups, lock fields you don't want changed — then
          save it as a reusable template.
        </div>
        <button
          onClick={() => setShowSave(true)}
          className="flex-none rounded-[11px] bg-rp-blue px-[16px] py-[8px] text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:bg-rp-blue-dk"
        >
          ＋ Save as template
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor />
      </div>
      {showSave && <SaveTemplateModal onClose={() => setShowSave(false)} />}
    </div>
  );
}
