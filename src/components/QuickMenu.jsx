import { PreviewButton } from "./Preview";
import { FocusButton } from "./Focus";
import { DiffuseButton } from "./Diffuse";

function QuickMenu({ onExport, onFocus, isFocusMode }) {
  return (
    <div className="quick-menu">
      <PreviewButton onClick={onExport} />
      {isFocusMode? <FocusButton onClick={onFocus} /> : <DiffuseButton onClick={onFocus} />}
    </div>
  );
}

export default QuickMenu;
