import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      {/* Hero Section - Left Text + Right Gallery */}
      <section className="landing-hero">
        <div className="hero-left">
          <h1 className="hero-title">3D QR DESIGNER</h1>
          <p className="hero-subtitle">
            Create custom 3D printable QR codes with text and images.<br />
            Perfect for business cards, signage, and creative projects.
          </p>
          <button className="hero-cta" onClick={handleStartClick}>
            Start Creating
          </button>
        </div>
        <div className="hero-right">
          <div className="gallery-grid">
            <div className="gallery-item gallery-item-portrait">
              <img
                src="/images/landing/gallery-1.webp"
                alt="3D printed business card with QR code"
                className="gallery-image"
              />
              <p className="gallery-caption">3D Printed Business Card</p>
            </div>
            <div className="gallery-item gallery-item-square">
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
      <section className="landing-section landing-section-alt">
        <h2 className="section-title">How to Use</h2>
        <p className="section-description">
          Follow these steps to create your 3D printed QR code
        </p>

        <div className="usage-steps">
          {/* Step 1 - Image Left */}
          <div className="usage-step-with-image">
            <div
              className="step-image-container"
              onClick={() => openLightbox('/images/tutorial/step1-design.webp')}
            >
              <img
                src="/images/tutorial/step1-design.webp"
                alt="Design your QR code in the web editor"
                className="step-image"
              />
            </div>
            <div className="step-text-container">
              <h3>1. Create Your Design</h3>
              <p>Use our editor to design your QR code with custom text and images. Adjust size, colors, and positioning. When ready, click the download button to export your design.</p>
            </div>
          </div>

          {/* Step 2 - Image Right */}
          <div className="usage-step-with-image usage-step-reverse">
            <div
              className="step-image-container"
              onClick={() => openLightbox('/images/tutorial/step2-blender.webp')}
            >
              <img
                src="/images/tutorial/step2-blender.webp"
                alt="Import to Blender and merge by distance"
                className="step-image"
              />
            </div>
            <div className="step-text-container">
              <h3>2. Post-process in Blender</h3>
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

          {/* Step 3 - Image Left */}
          <div className="usage-step-with-image">
            <div
              className="step-image-container"
              onClick={() => openLightbox('/images/tutorial/step3-export.webp')}
            >
              <img
                src="/images/tutorial/step3-export.webp"
                alt="Export as OBJ file from Blender"
                className="step-image"
              />
            </div>
            <div className="step-text-container">
              <h3>3. Export from Blender</h3>
              <p>After merging vertices, export the model as OBJ format. Make sure to include both the .obj and .mtl files for proper material information.</p>
            </div>
          </div>

          {/* Step 4 - Image Right */}
          <div className="usage-step-with-image usage-step-reverse">
            <div
              className="step-image-container"
              onClick={() => openLightbox('/images/tutorial/step4-slicer.webp')}
            >
              <img
                src="/images/tutorial/step4-slicer.webp"
                alt="Import to slicer software"
                className="step-image"
              />
            </div>
            <div className="step-text-container">
              <h3>4. Slice and Print</h3>
              <p>Import the processed OBJ into your slicer (e.g., Bambu Studio, PrusaSlicer, Cura). Configure your print settings and start printing your 3D QR code!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section className="landing-section">
        <h2 className="section-title">Video Tutorial</h2>
        <p className="section-description">
          Watch a complete walkthrough of the 3D QR creation process
        </p>
        <div className="video-container">
          {/* Placeholder for YouTube video - add iframe src later */}
          <div className="video-placeholder">
            <p>Video tutorial coming soon!</p>
            <p className="video-note">YouTube video will be embedded here</p>
          </div>
          {/* Example iframe structure (uncomment and add video ID when ready):
          <iframe
            className="video-iframe"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            title="3D QR Generator Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          */}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="landing-section landing-section-alt">
        <div className="feedback-content">
          <h2 className="section-title">Feedback</h2>
          <p className="section-description">
            Have questions, suggestions, or found a bug?<br />
            Feel free to reach out!
          </p>
          <a href="mailto:lsh678902@gmail.com" className="feedback-email">
            lsh678902@gmail.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>3D QR Generator</p>
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
