/**
 * Gets the color mode from `localStorage`. If no color mode is stored, attempts to get the system color.
 * @returns {'dark' | 'light'} The color stored in local storage, or the system color. If no color can be returned,
 * defaults to `light`.
 */
const getColorMode = () => {
  let colorMode = 'light';

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    colorMode = 'dark';
  }

  try {
    colorMode = window.localStorage.getItem('colorMode') ?? colorMode;
  } catch (_) {}

  return colorMode;
};

/**
 * Updates the `localStorage`, the styling (via a `data-theme` attribute on the body) and changes the styling of the
 * color switch button.
 * @param {'dark' | 'light' | 'auto'} colorMode - The new color mode to switch to.
 */
const setColorMode = (colorMode) => {
  const colorModeButtonIcon = document.getElementById('colorModeButtonIcon');

  if (!colorModeButtonIcon || (colorMode !== 'dark' && colorMode !== 'light')) {
    return;
  }

  try {
    window.localStorage.setItem('colorMode', colorMode);
  } catch (_) {}

  // update the styles
  window.document.body.setAttribute('data-theme', colorMode);

  if (colorMode === 'dark') {
    colorModeButtonIcon.classList.remove('bi-brightness-high');
    colorModeButtonIcon.classList.add('bi-moon');

    return;
  }

  if (colorMode === 'light') {
    colorModeButtonIcon.classList.remove('bi-moon');
    colorModeButtonIcon.classList.add('bi-brightness-high');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const colorModeButton = document.getElementById('colorModeButton');
  let colorMode

  if (!colorModeButton) {
    return;
  }

  colorMode = getColorMode();

  setColorMode(colorMode);

  // add click handler to set the color mode based on the stored one.
  colorModeButton.addEventListener('click', () => setColorMode(getColorMode() === 'light' ? 'dark' : 'light'));
});
