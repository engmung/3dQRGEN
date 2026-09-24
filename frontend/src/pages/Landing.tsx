
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import './Landing.css';

export function Landing() {
  const navigate = useNavigate();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleStartClick = () => {
    navigate('/editor');
  };

  const openLightbox = (imageSrc: string) => {
    setLightboxImage(imageSrc);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="landing">
      <SEO 
        title="3D QR Designer - Create Free 3D Printable QR Codes"
        description="The best free tool to create custom 3D printable QR codes. Add text, convert images to 3D, and export as STL/OBJ for 3D printing. Open source project."
      />

      {/* Notice Banner - Domain Migration & Open Source */}
      <div className="landing-banner">
        <div className="banner-content">
          <span className="banner-badge">Notice</span>
          <span className="banner-text">
            본 서비스는 오픈소스로 전환되어 <strong>3d-qrgen.vercel.app</strong>에서 영구 무료로 제공됩니다. (기존 3dqr.design 도메인은 2026년 10월까지 유지)
          </span>
          <a
            href="https://github.com/engmung/3dQRGEN"
            target="_blank"
            rel="noopener noreferrer"
            className="banner-link"
          >
            GitHub 코드 보기 ➔
          </a>
        </div>
      </div>

      {/* Hero Section - Left Text + Right Gallery */}
      <section className="landing-hero" aria-label="Introduction">
        <div className="hero-left">
          <h1 className="hero-title">3D QR DESIGNER</h1>
          <p className="hero-subtitle">
            Create custom 3D printable QR codes with text and images.<br />
            Perfect for business cards, signage, and creative projects.
          </p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={handleStartClick}>
              Start Creating
            </button>
            <div className="hero-specs">
              <span className="spec-tag">⭐ Open Source</span>
              <span className="spec-tag">✨ Free & No Login</span>
              <span className="spec-tag">🔒 Client-Side Privacy</span>
              <span className="spec-tag">🖨️ STL / OBJ Export</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="gallery-grid">
            <div className="gallery-item gallery-item-square">
              <img
                src="/images/landing/gallery-1.webp"
                alt="3D printed business card with QR code"
                className="gallery-image"
              />
              <p className="gallery-caption">3D Printed Business Card</p>
            </div>
            <div className="gallery-item gallery-item-portrait">
              <img
                src="/images/landing/gallery-2.webp"
                alt="Various 3D printed QR plates"
                className="gallery-image"
              />
              <p className="gallery-caption">Custom QR Plates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guide Section with Images */}
      <section className="landing-section landing-section-alt" itemScope itemType="https://schema.org/HowTo">
        <h2 className="section-title" itemProp="name">How to Make a 3D QR Code</h2>
        <p className="section-description" itemProp="description">
          Follow these steps to create your 3D printed QR code
        </p>

        <div className="usage-steps">
          {/* Step 1 - Image Left */}
          <div className="usage-step-with-image" itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <meta itemProp="position" content="1" />
            <div
              className="step-image-container"
              onClick={() => openLightbox('/images/tutorial/step1-design.webp')}
            >
              <img
                src="/images/tutorial/step1-design.webp"
                alt="Design your QR code in the web editor"
                className="step-image"
                itemProp="image"
              />
            </div>
            <div className="step-text-container">
              <h3 itemProp="name">1. Create Your Design</h3>
              <p itemProp="text">Use our editor to design your QR code with custom text and images. Adjust size, colors, and positioning. When ready, click the download button to export your design.</p>
            </div>
          </div>

          {/* Step 2 - Image Right */}
          <div className="usage-step-with-image usage-step-reverse" itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <meta itemProp="position" content="2" />
            <div
              className="step-image-container"
              onClick={() => openLightbox('/images/tutorial/step4-slicer.webp')}
            >
              <img
                src="/images/tutorial/step4-slicer.webp"
                alt="Import to slicer software"
                className="step-image"
                itemProp="image"
              />
            </div>
            <div className="step-text-container">
              <h3 itemProp="name">2. Slice and Print</h3>
              <p itemProp="text">Import the OBJ file directly into your slicer (e.g., Bambu Studio, PrusaSlicer, Cura). Configure your print settings and start printing your 3D QR code!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator & Patternflow Section */}
      <section className="landing-section creator-section">
        <div className="creator-card">
          <div className="creator-badge">Creator's New Project ✨</div>
          <h2 className="creator-title">Patternflow</h2>
          <p className="creator-tagline">Where Sound Meets Light — LED Visual Synthesizer</p>
          <p className="creator-description">
            3D QR Designer 제작자 <strong>이승훈(Lee Seunghun)</strong>의 새로운 프로젝트입니다.<br />
            소리와 빛의 인터랙션을 직관적인 피지컬 하드웨어로 조작할 수 있는 오픈소스 LED 신디사이저 <strong>Patternflow</strong>를 만나보세요.
          </p>
          <div className="creator-actions">
            <a
              href="https://patternflow.work"
              target="_blank"
              rel="noopener noreferrer"
              className="creator-btn primary"
            >
              Patternflow 구경하러 가기 ➔
            </a>
            <a
              href="https://github.com/engmung"
              target="_blank"
              rel="noopener noreferrer"
              className="creator-btn secondary"
            >
              제작자 GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="landing-section landing-section-alt">
        <div className="feedback-content">
          <h2 className="section-title">Feedback & Inquiries</h2>
          <p className="section-description">
            질문, 제안사항, 버그 제보가 있으신가요?<br />
            편하게 이메일이나 GitHub 이슈로 남겨주세요!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:lsh678902@gmail.com" className="feedback-email">
              lsh678902@gmail.com
            </a>
            <a
              href="https://github.com/engmung/3dQRGEN/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="feedback-email"
              style={{ backgroundColor: '#4a5568' }}
            >
              GitHub Issues
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-links">
          <span>Created by <strong>Lee Seunghun (이승훈)</strong></span>
          <span className="footer-dot">•</span>
          <a href="https://patternflow.work" target="_blank" rel="noopener noreferrer">Patternflow</a>
          <span className="footer-dot">•</span>
          <a href="https://github.com/engmung/3dQRGEN" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
          <span className="footer-dot">•</span>
          <a href="https://lshsprotfolio.netlify.app/en/" target="_blank" rel="noopener noreferrer">Portfolio</a>
        </div>
        <p className="footer-subtext">
          3D QR Designer is now an open-source project hosted on Vercel (<a href="https://3d-qrgen.vercel.app">3d-qrgen.vercel.app</a>).
        </p>
      </footer>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              ×
            </button>
            <img src={lightboxImage} alt="Tutorial step" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
}
