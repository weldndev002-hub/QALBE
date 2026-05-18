import { Link } from 'react-router-dom';

export default function UpgradeBanner({ feature, requiredTier, message }) {
  return (
    <div className="bg-secondary-100 border border-secondary-400 rounded-2xl p-4 text-center my-4">
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Upgrade required</h3>
      <p className="text-neutral-700 mb-4">
        {message || `You need to be on the ${requiredTier} plan to use the ${feature} feature.`}
      </p>
      <Link 
        to="/upgrade" 
        className="inline-block bg-primary-600 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-500 transition-colors"
      >
        Upgrade Now
      </Link>
    </div>
  );
}
