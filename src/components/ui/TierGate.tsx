import { useAuthStore } from '../../store/authStore';
import UpgradeBanner from './UpgradeBanner';

// Tiers: 'free', 'basic', 'premium'
const tierLevels = {
  free: 0,
  basic: 1,
  premium: 2,
};

export default function TierGate({ children, requiredTier, feature }) {
  const { user } = useAuthStore();
  const userTier = user?.tier || 'free';
  
  if (tierLevels[userTier] < tierLevels[requiredTier]) {
    return <UpgradeBanner feature={feature} requiredTier={requiredTier} />;
  }
  
  return <>{children}</>;
}
