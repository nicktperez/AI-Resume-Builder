// Critical CSS for above-the-fold content
export const criticalCSS = `
  :root {
    color-scheme: light;
    --foreground: #111827;
    --background: #f9fafb;
    --primary: #2563eb;
    --primary-dark: #1e40af;
    --surface: #ffffff;
    --surface-muted: #f3f4f6;
    --border: #e5e7eb;
    --muted: #6b7280;
    --brand-gradient-start: #eef2ff;
    --brand-gradient-end: #f5f3ff;
    --brand-accent: #312e81;
    --pro-gradient-start: #4f46e5;
    --pro-gradient-end: #6366f1;
    --success: #22c55e;
    --warning: #f59e0b;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  html, body {
    padding: 0;
    margin: 0;
  }

  body {
    background: linear-gradient(180deg, rgba(238, 242, 255, 0.6) 0%, #ffffff 65%);
    color: var(--foreground);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }

  button {
    cursor: pointer;
  }

  .container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .header {
    background: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(15, 23, 42, 0.05);
    backdrop-filter: blur(16px);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .header-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 0;
  }

  .brand {
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: -0.01em;
    color: var(--brand-accent);
  }

  .nav-links {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    flex-wrap: wrap;
    font-weight: 500;
  }

  .nav-links a {
    color: var(--muted);
    transition: color 0.2s ease;
  }

  .nav-links a:hover {
    color: var(--primary-dark);
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .primary {
    background: var(--primary);
    border: none;
    color: white;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.2s ease;
  }

  .primary:hover {
    background: var(--primary-dark);
  }

  .hero {
    padding: 6.5rem 0 5rem;
    text-align: center;
    position: relative;
  }

  .hero-gradient {
    background: radial-gradient(120% 120% at 50% 5%, rgba(79, 70, 229, 0.16), rgba(255, 255, 255, 0));
  }

  .hero-inner {
    display: flex;
    justify-content: center;
  }

  .hero-content {
    max-width: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .hero-content h1 {
    margin: 0;
    font-size: clamp(2.75rem, 5vw, 3.75rem);
    letter-spacing: -0.03em;
  }

  .hero-content p {
    margin: 0;
    font-size: 1.2rem;
    color: var(--muted);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(37, 99, 235, 0.12);
    color: var(--primary-dark);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .hero-badge {
    justify-content: center;
    margin: 0 auto;
    background: rgba(79, 70, 229, 0.18);
    color: var(--brand-accent);
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .cta-pro {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1.4rem;
    border-radius: 9999px;
    font-weight: 600;
    color: var(--brand-accent);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(59, 130, 246, 0.08));
    border: 1px solid rgba(79, 70, 229, 0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .cta-pro:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 30px -20px rgba(79, 70, 229, 0.4);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.18), rgba(59, 130, 246, 0.12));
  }
`;

// Function to inject critical CSS
export function injectCriticalCSS() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }
}
