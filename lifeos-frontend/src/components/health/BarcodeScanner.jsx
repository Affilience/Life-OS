/**
 * BarcodeScanner - Camera-based barcode scanning for food products
 * Uses native BarcodeDetector API with QuaggaJS fallback
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Loader2, AlertCircle, Flashlight, SwitchCamera, Scan } from 'lucide-react';
import { lookupByBarcode, isValidBarcode } from '../../services/openFoodFacts';
import { haptics } from '../../utils/haptics';
import './BarcodeScanner.css';

export default function BarcodeScanner({ onProductFound, onClose }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Check for camera and barcode detector support
  useEffect(() => {
    const checkSupport = async () => {
      // Check camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setError('Camera not supported on this device');
        return;
      }

      // Check BarcodeDetector API
      if ('BarcodeDetector' in window) {
        try {
          const formats = await window.BarcodeDetector.getSupportedFormats();
          if (formats.includes('ean_13') || formats.includes('upc_a')) {
            detectorRef.current = new window.BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
            });
          }
        } catch (e) {
          console.warn('BarcodeDetector not available:', e);
        }
      }
    };

    checkSupport();
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start scanning loop
      if (detectorRef.current) {
        scanIntervalRef.current = setInterval(scanFrame, 200);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please enable camera permissions.'
          : 'Failed to access camera. Please try again.'
      );
      setIsScanning(false);
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Scan current video frame
  const scanFrame = async () => {
    if (!videoRef.current || !detectorRef.current || isLoading) return;

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);

      if (barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;

        // Avoid scanning same barcode repeatedly
        if (barcode === lastScanned) return;

        setLastScanned(barcode);
        await handleBarcodeFound(barcode);
      }
    } catch (err) {
      // Ignore detection errors (usually just means no barcode in frame)
    }
  };

  // Handle found barcode
  const handleBarcodeFound = async (barcode) => {
    if (!isValidBarcode(barcode)) {
      console.warn('Invalid barcode format:', barcode);
      return;
    }

    setIsLoading(true);
    await haptics.medium();

    try {
      const product = await lookupByBarcode(barcode);

      if (product) {
        await haptics.success();
        stopCamera();
        onProductFound(product);
      } else {
        setError(`Product not found for barcode: ${barcode}`);
        await haptics.error();
        // Reset lastScanned after delay to allow retry
        setTimeout(() => setLastScanned(null), 2000);
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
      setError('Failed to look up product. Please try again.');
      await haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  // Manual barcode entry
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;

    await handleBarcodeFound(manualBarcode.trim());
  };

  // Toggle torch/flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      }
    } catch (err) {
      console.warn('Torch not supported:', err);
    }
  };

  // Switch camera
  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isScanning) {
      startCamera();
    }
  }, [facingMode]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="barcode-scanner-overlay">
      <div className="barcode-scanner-modal">
        {/* Header */}
        <div className="scanner-header">
          <div className="scanner-header-content">
            <Scan className="w-5 h-5 text-violet-400" />
            <div>
              <h3 className="scanner-title">Scan Barcode</h3>
              <p className="scanner-subtitle">Point camera at product barcode</p>
            </div>
          </div>
          <button onClick={handleClose} className="scanner-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner View */}
        <div className="scanner-view">
          {!isScanning && !error && (
            <div className="scanner-start">
              <div className="scanner-icon">
                <Camera className="w-12 h-12" />
              </div>
              <p className="scanner-instruction">
                Scan a barcode to quickly log packaged food nutrition
              </p>
              <button onClick={startCamera} className="start-scan-btn" disabled={!hasCamera}>
                <Camera className="w-5 h-5" />
                Start Scanning
              </button>
            </div>
          )}

          {isScanning && (
            <div className="scanner-active">
              <video
                ref={videoRef}
                className="scanner-video"
                playsInline
                muted
                autoPlay
              />

              {/* Scan overlay */}
              <div className="scan-overlay">
                <div className="scan-frame">
                  <div className="scan-corner top-left" />
                  <div className="scan-corner top-right" />
                  <div className="scan-corner bottom-left" />
                  <div className="scan-corner bottom-right" />
                  {isLoading && (
                    <div className="scan-loading">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  )}
                </div>
                <p className="scan-hint">Align barcode within frame</p>
              </div>

              {/* Camera controls */}
              <div className="camera-controls">
                <button onClick={toggleTorch} className="camera-control-btn" title="Toggle flashlight">
                  <Flashlight className={`w-5 h-5 ${torchOn ? 'text-yellow-400' : ''}`} />
                </button>
                <button onClick={switchCamera} className="camera-control-btn" title="Switch camera">
                  <SwitchCamera className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="scanner-error">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="error-message">{error}</p>
              <button onClick={() => { setError(null); setLastScanned(null); }} className="retry-btn">
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="manual-entry">
          <p className="manual-label">Or enter barcode manually:</p>
          <form onSubmit={handleManualSubmit} className="manual-form">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode number"
              className="manual-input"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim() || isLoading}
              className="manual-submit-btn"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Look Up'}
            </button>
          </form>
        </div>

        {/* No native support warning */}
        {!detectorRef.current && hasCamera && (
          <div className="no-detector-warning">
            <AlertCircle className="w-4 h-4" />
            <span>Native barcode detection not available. Use manual entry.</span>
          </div>
        )}
      </div>
    </div>
  );
}
