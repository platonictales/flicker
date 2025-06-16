import { PreviewButton } from "./Preview";
import { FocusButton } from "./Focus";
import { DiffuseButton } from "./Diffuse";
import { ThemeButton } from "./Theme";

function QuickMenu({ onExport, onFocus, isFocusMode, onThemeChange }) {
  return (
    <div className="quick-menu">
      <PreviewButton onClick={onExport} />
      {isFocusMode? <FocusButton onClick={onFocus} /> : <DiffuseButton onClick={onFocus} />}
      <ThemeButton onClick={onThemeChange}/>
    </div>
  );
}

export default QuickMenu;
