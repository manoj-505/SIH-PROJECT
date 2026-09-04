import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
  documentTypeLabel?: string;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Scan Medical Document',
  documentTypeLabel = 'Prescription / Certificate'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Camera not accessible. You can use our high-resolution sample scanner snapshot.');
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleUseSampleScan = () => {
    // Generate a clean mock prescription / certificate snapshot
    const sampleUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80';
    setCapturedImage(sampleUrl);
    stopCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-kiosk">{title}</h3>
              <p className="text-xs text-slate-400">Position {documentTypeLabel} inside the highlighted frame</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Viewfinder / Captured Preview Area */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <img
                src={capturedImage}
                alt="Captured document"
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
              <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <CheckCircle className="w-4 h-4" />
                <span>Captured Ready for OCR</span>
              </div>
            </div>
          ) : cameraError ? (
            <div className="p-8 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-sm text-slate-300 mb-5">{cameraError}</p>
              <button
                type="button"
                onClick={handleUseSampleScan}
                className="kiosk-btn px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-sky-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg hover:brightness-110"
              >
                <Sparkles className="w-4 h-4" />
                <span>Use Realistic Kiosk Document Scan</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder framing guideline overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-primary-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
                </div>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md border border-white/10">
                    Align document edges within guide
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
                    <span className="text-sm font-medium text-slate-300">Activating Scanner Camera...</span>
                  </div>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="kiosk-btn px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm inline-flex items-center gap-2 border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="kiosk-btn px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Analyze</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleUseSampleScan}
                className="text-xs text-slate-400 hover:text-primary-300 underline font-medium"
              >
                Simulate Demo Document
              </button>
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={Boolean(cameraError) || isInitializing}
                className="kiosk-btn px-8 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold text-base inline-flex items-center gap-2 shadow-lg shadow-primary-600/40"
              >
                <Camera className="w-5 h-5" />
                <span>Capture Document</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
