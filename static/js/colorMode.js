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
const onClick = () => {
  setColorMode(getColorMode() === 'dark' ? 'light' : 'dark');
};
const setColorMode = (colorMode) => {
  const colorModeButtonIcon = document.getElementById('colorModeButtonIcon');

  if (!colorModeButtonIcon) {
    return;
  }

  try {
    window.localStorage.setItem('colorMode', colorMode);
  } catch (_) {}

  if (colorMode === 'dark') {
    colorModeButtonIcon.classList.remove('bi-brightness-high');
    colorModeButtonIcon.classList.add('bi-moon');
    window.document.documentElement
    window.document.documentElement.style.setProperty('--gray-100', 'rgba(255, 255, 255, 0.1)');
    window.document.documentElement.style.setProperty('--gray-200', 'rgba(255, 255, 255, 0.2)');
    window.document.documentElement.style.setProperty('--gray-500', 'rgba(255, 255, 255, 0.5)');
    window.document.documentElement.style.setProperty('--color-link', '#84b2ff');
    window.document.documentElement.style.setProperty('--color-visited-link', '#b88dff');
    window.document.documentElement.style.setProperty('--body-background', '#343a40');
    window.document.documentElement.style.setProperty('--body-font-color', '#e9ecef');
    window.document.documentElement.style.setProperty('--icon-filter', 'brightness(0) invert(1)');

    return;
  }

  colorModeButtonIcon.classList.remove('bi-moon');
  colorModeButtonIcon.classList.add('bi-brightness-high');
  window.document.documentElement.style.setProperty('--gray-100', '#f8f9fa');
  window.document.documentElement.style.setProperty('--gray-200', '#e9ecef');
  window.document.documentElement.style.setProperty('--gray-500', '#adb5bd');
  window.document.documentElement.style.setProperty('--color-link', '#0055bb');
  window.document.documentElement.style.setProperty('--color-visited-link', '#8440f1');
  window.document.documentElement.style.setProperty('--body-background', 'white');
  window.document.documentElement.style.setProperty('--body-font-color', 'black');
  window.document.documentElement.style.setProperty('--icon-filter', 'none');
};

window.addEventListener('DOMContentLoaded', () => {
  const colorModeButton = document.getElementById('colorModeButton');
  const colorModeButtonIcon = document.getElementById('colorModeButtonIcon');
  let colorMode

  if (!colorModeButtonIcon) {
    return;
  }

  colorMode = getColorMode();

  setColorMode(colorMode);
  colorModeButton.addEventListener('click', onClick);
});
