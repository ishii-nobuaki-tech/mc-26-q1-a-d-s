import { useEffect, useState } from "react";

export default function RefererGuard({ children }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const ref = document.referrer || "";

    const allowedDomains = [
      "sharepoint.com",
      "sptvjsat365.sharepoint.com"
    ];

    const ok = allowedDomains.some(d => ref.includes(d));
    setAllowed(ok);
  }, []);

  if (!allowed) {
    return <div>Access denied</div>;
  }

  return children;
}
