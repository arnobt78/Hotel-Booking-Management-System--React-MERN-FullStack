/**
 * Radix Select wraps content in react-remove-scroll (no modal={false} like DropdownMenu).
 * That sets inline margin-right + overflow:hidden → double gutter / hidden page thumb /
 * page scroll dies while the menu is open. CSS loses to inline !important — override both.
 */
function neutralizeScrollLock(body: HTMLElement) {
  body.style.setProperty("margin-right", "0px", "important");
  body.style.setProperty("padding-right", "0px", "important");
  // Keep page scrollbar + scrolling (Select is not a true modal)
  body.style.setProperty("overflow", "visible", "important");
  body.style.setProperty("overflow-y", "visible", "important");
  document.documentElement.style.setProperty("overflow-y", "scroll", "important");
}

function clearScrollLock(body: HTMLElement) {
  body.style.removeProperty("margin-right");
  body.style.removeProperty("padding-right");
  body.style.removeProperty("overflow");
  body.style.removeProperty("overflow-y");
  document.documentElement.style.removeProperty("overflow-y");
}

export function installScrollLockGapFix(): void {
  if (typeof document === "undefined") return;

  const sync = () => {
    const body = document.body;
    if (body.hasAttribute("data-scroll-locked")) {
      neutralizeScrollLock(body);
    } else {
      clearScrollLock(body);
    }
  };

  sync();

  const observer = new MutationObserver(sync);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-scroll-locked", "style"],
  });
}
