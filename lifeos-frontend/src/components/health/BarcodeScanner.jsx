/**
 * BarcodeScanner - Universal barcode scanning for food products
 *
 * Supports:
 * - Native mobile (iOS/Android): Capacitor MLKit barcode scanning
 * - Web (Chrome/Edge): Native BarcodeDetector API
 * - Web (all browsers): html5-qrcode fallback
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Loader2, AlertCircle, Flashlight, SwitchCamera, Scan } from 'lucide-react';
import { lookupByBarcode, isValidBarcode } from '../../services/openFoodFacts';
import { haptics } from '../../utils/haptics';
import { Capacitor } from '@capacitor/core';
import './BarcodeScanner.css';

// Lazy load html5-qrcode only when needed (web fallback)
let Html5Qrcode = null;

export default function BarcodeScanner({ onProductFound, onClose }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannerType, setScannerType] = useState(null); // 'native-mobile', 'native-web', 'html5-qrcode'

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'html5-qrcode-scanner';

  // Determine the best scanner to use
  useEffect(() => {
    const detectScannerType = async () => {
      // Check if running in native mobile app
      if (Capacitor.isNativePlatform()) {
        setScannerType('native-mobile');
        return;
      }

      // Check camera availability
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setError('Camera not supported on this device');
        return;
      }

      // Check for native BarcodeDetector API (Chrome/Edge)
      if ('BarcodeDetector' in window) {
        try {
          const formats = await window.BarcodeDetector.getSupportedFormats();
          if (formats.includes('ean_13') || formats.includes('upc_a')) {
            detectorRef.current = new window.BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
            });
            setScannerType('native-web');
            return;
          }
        } catch (e) {
          console.warn('BarcodeDetector not available:', e);
        }
      }

      // Fallback to html5-qrcode for Safari, Firefox, etc.
      setScannerType('html5-qrcode');
    };

    detectScannerType();
  }, []);

  // Load html5-qrcode library when needed
  const loadHtml5QrCode = async () => {
    if (!Html5Qrcode) {
      const module = await import('html5-qrcode');
      Html5Qrcode = module.Html5Qrcode;
    }
    return Html5Qrcode;
  };

  // Start native mobile scanner (Capacitor MLKit)
  const startNativeMobileScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const { BarcodeScanner: CapacitorBarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');

      // Request permissions
      const { camera } = await CapacitorBarcodeScanner.requestPermissions();
      if (camera !== 'granted') {
        throw new Error('Camera permission denied');
      }

      // Start continuous scanning
      await CapacitorBarcodeScanner.addListener('barcodeScanned', async (result) => {
        const barcode = result.barcode.rawValue;
        if (barcode && barcode !== lastScanned) {
          setLastScanned(barcode);
          await handleBarcodeFound(barcode);
        }
      });

      await CapacitorBarcodeScanner.startScan({
        formats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E'],
      });

      // Add scanning UI class to body for native overlay
      document.body.classList.add('barcode-scanning');
    } catch (err) {
      console.error('Native scanner error:', err);
      setError(err.message || 'Failed to start scanner');
      setIsScanning(false);
    }
  };

  // Stop native mobile scanner
  const stopNativeMobileScanner = async () => {
    try {
      const { BarcodeScanner: CapacitorBarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
      await CapacitorBarcodeScanner.removeAllListeners();
      await CapacitorBarcodeScanner.stopScan();
      document.body.classList.remove('barcode-scanning');
    } catch (err) {
      console.warn('Error stopping native scanner:', err);
    }
    setIsScanning(false);
  };

  // Start web camera stream (for native-web and html5-qrcode)
  const startWebCamera = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      if (scannerType === 'html5-qrcode') {
        await startHtml5QrCodeScanner();
      } else {
        // Native BarcodeDetector API
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
  }, [facingMode, scannerType]);

  // Start html5-qrcode scanner
  const startHtml5QrCodeScanner = async () => {
    try {
      const Html5QrCodeLib = await loadHtml5QrCode();

      // Clean up any existing scanner
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }

      html5QrCodeRef.current = new Html5QrCodeLib(scannerContainerId);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777,
        formatsToSupport: [
          0, // QR_CODE (included for flexibility)
          1, // AZTEC
          2, // CODABAR
          3, // CODE_39
          4, // CODE_93
          5, // CODE_128
          6, // DATA_MATRIX
          7, // MAXICODE
          8, // ITF
          9, // EAN_13
          10, // EAN_8
          11, // PDF_417
          12, // RSS_14
          13, // RSS_EXPANDED
          14, // UPC_A
          15, // UPC_E
          16, // UPC_EAN_EXTENSION
        ],
      };

      await html5QrCodeRef.current.start(
        { facingMode },
        config,
        async (decodedText) => {
          if (decodedText && decodedText !== lastScanned) {
            setLastScanned(decodedText);
            await handleBarcodeFound(decodedText);
          }
        },
        () => {} // Error callback (ignore, just means no barcode in frame)
      );
    } catch (err) {
      console.error('html5-qrcode error:', err);
      throw err;
    }
  };

  // Stop camera
  const stopCamera = useCallback(async () => {
    if (scannerType === 'native-mobile') {
      await stopNativeMobileScanner();
      return;
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.warn('Error stopping html5-qrcode:', e);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  }, [scannerType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Scan current video frame (native-web only)
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
        await stopCamera();
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
    if (scannerType === 'native-mobile') {
      try {
        const { BarcodeScanner: CapacitorBarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
        await CapacitorBarcodeScanner.toggleTorch();
        setTorchOn(!torchOn);
      } catch (err) {
        console.warn('Torch not supported:', err);
      }
      return;
    }

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
    await stopCamera();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isScanning && scannerType !== 'native-mobile') {
      startWebCamera();
    }
  }, [facingMode]);

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  const startCamera = scannerType === 'native-mobile' ? startNativeMobileScanner : startWebCamera;

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
              <button onClick={startCamera} className="start-scan-btn" disabled={!hasCamera || !scannerType}>
                <Camera className="w-5 h-5" />
                {!scannerType ? 'Initializing...' : 'Start Scanning'}
              </button>
              {scannerType && (
                <p className="text-xs text-white/40 mt-2">
                  Using: {scannerType === 'native-mobile' ? 'Native Camera' :
                         scannerType === 'native-web' ? 'Browser Scanner' : 'Universal Scanner'}
                </p>
              )}
            </div>
          )}

          {isScanning && scannerType !== 'native-mobile' && (
            <div className="scanner-active">
              {scannerType === 'html5-qrcode' ? (
                <div id={scannerContainerId} className="w-full h-full min-h-[300px]" />
              ) : (
                <video
                  ref={videoRef}
                  className="scanner-video"
                  playsInline
                  muted
                  autoPlay
                />
              )}

              {/* Scan overlay (only for native-web) */}
              {scannerType === 'native-web' && (
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
              )}

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

          {isScanning && scannerType === 'native-mobile' && (
            <div className="scanner-active native-mobile-scanning">
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                <p className="text-white/70">Camera is active</p>
                <p className="text-white/50 text-sm">Point at barcode to scan</p>
                <button
                  onClick={stopCamera}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                >
                  Stop Scanning
                </button>
              </div>
              {/* Camera controls for native */}
              <div className="camera-controls">
                <button onClick={toggleTorch} className="camera-control-btn" title="Toggle flashlight">
                  <Flashlight className={`w-5 h-5 ${torchOn ? 'text-yellow-400' : ''}`} />
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

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <p className="text-white/70">Looking up product...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
