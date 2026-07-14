// client/src/components/ui/Spinner.jsx
const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

const Spinner = ({ size = 'md', label = 'Loading...' }) => (
  <div className="flex flex-col items-center gap-3">
    <div
      className={`${sizeMap[size]} rounded-full border-2 border-gray-700 border-t-blue-500 animate-spin`}
      role="status"
      aria-label={label}
    />
    {size === 'lg' && <p className="text-sm text-gray-400">{label}</p>}
  </div>
);

export default Spinner;