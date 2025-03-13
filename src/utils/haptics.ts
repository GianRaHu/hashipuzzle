export const triggerHaptic = (style: 'light' | 'medium' | 'heavy') => {
  if (!window.navigator?.vibrate) return;
  
  switch (style) {
    case 'light':
      window.navigator.vibrate(10);
      break;
    case 'medium':
      window.navigator.vibrate(20);
      break;
    case 'heavy':
      window.navigator.vibrate(30);
      break;
  }
};
