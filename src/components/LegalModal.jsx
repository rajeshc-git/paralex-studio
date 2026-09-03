import React from 'react';
import { Layers, X, ArrowLeft } from 'lucide-react';

export default function LegalModal({ type, onClose, onSwitchType }) {
  if (!type) return null;

  const isTerms = type === 'terms';

  return (
    <div className="legal-modal-backdrop" onClick={onClose}>
      <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Row with Brand & Close Button */}
        <div className="legal-top-bar">
          <div className="legal-brand-header">
            <div className="legal-brand-icon">
              <Layers size={16} />
            </div>
            <span className="legal-brand-name">
              Paralex <span className="brand-badge-3d">3D</span>
            </span>
          </div>

          <button className="legal-close-btn" onClick={onClose} title="Back to Paralex Studio">
            <X size={16} />
          </button>
        </div>

        {isTerms ? (
          /* TERMS & CONDITIONS */
          <div className="legal-content">
            <h1 className="legal-title">Terms &amp; Conditions</h1>
            <div className="legal-date">Last updated: September 2026</div>

            <div className="legal-section">
              <h2 className="legal-section-title">Acceptance of terms</h2>
              <p className="legal-paragraph">
                By using Paralex 3D, you agree to these Terms &amp; Conditions.
                If you do not agree, please do not use the service.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Acceptable use</h2>
              <p className="legal-paragraph">
                You are responsible for the photos and images you process and must have the
                legal right to use them. Do not use the service to process unlawful content
                or to infringe the intellectual property rights of others.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Service “as is”</h2>
              <p className="legal-paragraph">
                The service is provided on an “as is” and “as available” basis without
                warranties of any kind. We work to keep it reliable and performant across devices,
                but do not guarantee uninterrupted or error-free operation.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Limitation of liability</h2>
              <p className="legal-paragraph">
                To the maximum extent permitted by law, Paralex shall not be liable for any
                indirect, incidental, or consequential loss arising from your use of the service.
                Always keep a backup of your original photos.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Contact</h2>
              <p className="legal-paragraph">
                Questions about these terms? Reach us at{' '}
                <a href="mailto:support@paralex3d.com" className="legal-link-highlight">
                  support@paralex3d.com
                </a>
                .
              </p>
            </div>

            <div className="legal-footer-nav">
              <button className="legal-nav-btn back-primary-btn" onClick={onClose}>
                <ArrowLeft size={14} />
                <span>Back to Paralex Studio</span>
              </button>
              <span className="legal-dot-sep">&middot;</span>
              <button
                className="legal-nav-btn"
                onClick={() => onSwitchType('privacy')}
              >
                Privacy Policy
              </button>
            </div>
          </div>
        ) : (
          /* PRIVACY POLICY */
          <div className="legal-content">
            <h1 className="legal-title">Privacy Policy</h1>
            <div className="legal-date">Last updated: September 2026</div>

            <div className="legal-section">
              <h2 className="legal-section-title">100% Client-Side Processing (Zero Photo Storage)</h2>
              <p className="legal-paragraph">
                <strong>We do not upload, process, or store your photos on any server.</strong>{' '}
                All image processing, depth estimation heuristics, WebGL spatial displacement,
                and media exports run entirely client-side directly within your browser.
                Your photos never leave your device.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">No Personal Data Collection</h2>
              <p className="legal-paragraph">
                Paralex 3D does not require user accounts, passwords, or personal identity
                information. We do not track, profile, or sell user data to third parties.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Device Sensors (Gyroscope &amp; Accelerometer)</h2>
              <p className="legal-paragraph">
                Motion and orientation sensor data is accessed strictly locally on your
                device in real-time to compute the interactive 3D parallax tilt angle.
                Sensor readings are never transmitted, recorded, or logged.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Media Exports</h2>
              <p className="legal-paragraph">
                When you export MP4 videos or GIF animations, the files are generated
                locally in browser memory using HTML5 Canvas and Web Audio APIs, and downloaded
                directly to your device.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Contact</h2>
              <p className="legal-paragraph">
                Questions about our privacy practices? Reach us at{' '}
                <a href="mailto:privacy@paralex3d.com" className="legal-link-highlight">
                  privacy@paralex3d.com
                </a>
                .
              </p>
            </div>

            <div className="legal-footer-nav">
              <button className="legal-nav-btn back-primary-btn" onClick={onClose}>
                <ArrowLeft size={14} />
                <span>Back to Paralex Studio</span>
              </button>
              <span className="legal-dot-sep">&middot;</span>
              <button
                className="legal-nav-btn"
                onClick={() => onSwitchType('terms')}
              >
                Terms &amp; Conditions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
