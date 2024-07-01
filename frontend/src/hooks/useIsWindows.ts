import Bowser from 'bowser';

export const useIsWindows = () => {
  const browser = Bowser.getParser(window.navigator.userAgent);
  const os = browser.getOSName();
  const isWindows = os === 'Windows';
  return { isWindows };
};
