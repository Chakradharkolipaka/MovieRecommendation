import { useAppStore } from '../store/useAppStore';

export function usePopup() {
  const popup = useAppStore((state) => state.popup);
  const showPopup = useAppStore((state) => state.showPopup);
  const closePopup = useAppStore((state) => state.closePopup);

  return {
    popup,
    showStep: (steps) => showPopup('step', { steps, currentStep: 0 }),
    showError: (error) => showPopup('error', error),
    showSuccess: (message) => showPopup('success', { message }),
    close: closePopup,
  };
}
