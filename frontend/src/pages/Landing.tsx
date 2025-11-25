import { useNavigate } from 'react-router-dom';
import './Landing.css';

export function Landing() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/editor');
  };

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">3D QR Generator</h1>
          <p className="hero-subtitle">
            Create custom 3D printable QR codes with text and images.<br />
            Perfect for business cards, signage, and creative projects.
          </p>
          <button className="hero-cta" onClick={handleStartClick}>
            Start Creating
          </button>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="landing-section">
        <h2 className="section-title">Gallery</h2>
        <p className="section-description">
          Check out what you can create with 3D QR Generator
        </p>
        <div className="gallery-grid">
          <div className="gallery-item gallery-item-portrait">
            <img
              src="/images/landing/gallery-1.jpg"
              alt="3D printed business card with QR code"
              className="gallery-image"
            />
            <p className="gallery-caption">3D Printed Business Card</p>
          </div>
          <div className="gallery-item gallery-item-square">
            <img
              src="/images/landing/gallery-2.jpg"
              alt="Various 3D printed QR plates"
              className="gallery-image"
            />
            <p className="gallery-caption">Custom QR Plates</p>
          </div>
        </div>
      </section>

      {/* Usage Guide Section */}
      <section className="landing-section landing-section-alt">
        <h2 className="section-title">How to Use</h2>
        <p className="section-description">
          Follow these steps to create your 3D printed QR code
        </p>

        <div className="usage-steps">
          <div className="usage-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Design</h3>
              <p>Use our editor to design your QR code with custom text and images. Adjust size, colors, and positioning.</p>
            </div>
          </div>

          <div className="usage-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Download OBJ File</h3>
              <p>Export your design as an OBJ file for 3D printing.</p>
            </div>
          </div>

          <div className="usage-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Post-process in Blender</h3>
              <p className="step-warning">
                <strong>Important:</strong> Do NOT slice the OBJ file directly!
              </p>
              <div className="blender-steps">
                <ol>
                  <li>Open Blender and import the OBJ file</li>
                  <li>Press <kbd>Tab</kbd> to enter Edit Mode</li>
                  <li>Press <kbd>A</kbd> to select all vertices</li>
                  <li>Press <kbd>M</kbd> and select <strong>"By Distance"</strong></li>
                  <li>This merges duplicate vertices (Merge by Distance)</li>
                  <li>Export as OBJ again</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="usage-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Slice and Print</h3>
              <p>Import the processed OBJ into your slicer (e.g., Bambu Studio, PrusaSlicer, Cura) and print!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Video Section */}
      <section className="landing-section">
        <h2 className="section-title">Video Tutorial</h2>
        <p className="section-description">
          Watch the step-by-step guide
        </p>
        <div className="video-container">
          <div className="video-placeholder">
            <div className="video-placeholder-content">
              <svg className="video-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <p>Video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="landing-section landing-section-alt">
        <h2 className="section-title">Feedback</h2>
        <p className="section-description">
          Have questions, suggestions, or found a bug?<br />
          Feel free to reach out!
        </p>
        <a href="mailto:lsh678902@gmail.com" className="feedback-email">
          lsh678902@gmail.com
        </a>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>3D QR Generator</p>
      </footer>
    </div>
  );
}
