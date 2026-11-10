'use client';

import { useUiStore } from '@/store/uiStore';
import KloeProModal from './KloeProModal';

export default function PremiumModal() {
  const { isPremiumModalOpen, premiumDefaultPlan, closePremiumModal } = useUiStore();

  return (
    <KloeProModal
      isOpen={isPremiumModalOpen}
      onClose={closePremiumModal}
      defaultPlan={premiumDefaultPlan}
      redirectBackToCloset={false}
    />
  );
}
