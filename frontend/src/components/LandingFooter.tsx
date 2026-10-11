import { Link } from 'react-router-dom';

/**
 * Footer shared by the landing and legal pages
 */
export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-links">
        <span>&copy; 2026 3D QR Designer</span>
        <span className="footer-dot">•</span>
        <a href="/#about">About</a>
        <span className="footer-dot">•</span>
        <Link to="/privacy">Privacy</Link>
        <span className="footer-dot">•</span>
        <Link to="/terms">Terms</Link>
        <span className="footer-dot">•</span>
        <a href="mailto:lsh678902@gmail.com">Contact</a>
        <span className="footer-dot">•</span>
        <a href="https://github.com/engmung/3dQRGEN" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  );
}
