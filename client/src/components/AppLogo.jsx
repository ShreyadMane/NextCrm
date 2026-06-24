export default function AppLogo({ showText = true, size = 'md', className = '' }) {
  return (
    <div className={`app-logo app-logo-${size} ${className}`}>
      <svg className="app-logo-mark" viewBox="0 0 44 44" role="img" aria-label="NexCRM logo">
        <rect className="app-logo-bg" x="3" y="3" width="38" height="38" rx="9" />
        <path className="app-logo-link" d="M13 29V15l18 14V15" />
        <circle className="app-logo-node node-one" cx="13" cy="15" r="3.2" />
        <circle className="app-logo-node node-two" cx="22" cy="22" r="3.2" />
        <circle className="app-logo-node node-three" cx="31" cy="29" r="3.2" />
        <path className="app-logo-spark" d="M31 12h5M33.5 9.5v5" />
      </svg>
      {showText && (
        <span className="app-logo-wordmark">
          <span>Nex</span>CRM
        </span>
      )}
    </div>
  );
}
