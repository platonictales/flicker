import { PreviewButton } from "./Preview";
import { FocusButton } from "./Focus";

function QuickMenu({ onExport }) {
  return (
    <div className="quick-menu">
      <PreviewButton onClick={onExport} />
      <FocusButton />
    </div>
  );
}

export default QuickMenu;
