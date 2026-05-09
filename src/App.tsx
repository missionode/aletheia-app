import { useState, useEffect, useRef } from 'react'
import { Shield, Camera, Fingerprint, Activity, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import FaceService from './services/FaceService'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function App() {
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<'TRUTH' | 'LIE' | null>(null)
  const [ownerDescriptor, setOwnerDescriptor] = useState<Float32Array | null>(null)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [currentFace, setCurrentFace] = useState<any>(null)
  const [showCalibration, setShowCalibration] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastTapRef = useRef<number>(0)

  // Load models and stored owner
  useEffect(() => {
    FaceService.loadModels().then(() => setIsModelsLoaded(true))
    const stored = localStorage.getItem('owner_descriptor')
    if (stored) {
      setOwnerDescriptor(new Float32Array(JSON.parse(stored)))
    }
  }, [])

  // Start camera
  useEffect(() => {
    if (isModelsLoaded) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream
        })
    }
  }, [isModelsLoaded])

  // Continuous detection
  useEffect(() => {
    let animationFrame: number
    let isDetecting = false
    
    const detect = async () => {
      if (videoRef.current && isModelsLoaded && !isDetecting && videoRef.current.readyState === 4) {
        isDetecting = true
        try {
          const face = await FaceService.detectFace(videoRef.current)
          setCurrentFace(face)
        } catch (err) {
          console.error("Detection error:", err)
        }
        isDetecting = false
      }
      animationFrame = requestAnimationFrame(detect)
    }
    detect()
    return () => cancelAnimationFrame(animationFrame)
  }, [isModelsLoaded])

  const handleToss = () => {
    if (!currentFace) {
      setResult(Math.random() > 0.5 ? 'TRUTH' : 'LIE')
      return
    }

    const isOwner = ownerDescriptor && FaceService.compareFaces(currentFace.descriptor, ownerDescriptor)
    const isSmiling = currentFace.expressions.happy > 0.7

    if (isOwner && isSmiling) {
      setResult('TRUTH') // The Rig
    } else {
      setResult(Math.random() > 0.5 ? 'TRUTH' : 'LIE') // Fair Play
    }
  }

  const calibrateOwner = () => {
    console.log("Calibrating...", currentFace)
    if (currentFace) {
      const descriptor = Array.from(currentFace.descriptor)
      localStorage.setItem('owner_descriptor', JSON.stringify(descriptor))
      setOwnerDescriptor(currentFace.descriptor)
      alert('BIOMETRIC SIGNATURE STORED')
      setShowCalibration(false)
    } else {
      console.warn("No face detected during calibration")
    }
  }

  const handleHeaderClick = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      setShowCalibration(prev => !prev)
    }
    lastTapRef.current = now
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-between p-6 overflow-hidden relative select-none">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Header */}
      <div className="w-full flex justify-between items-center z-10" onClick={handleHeaderClick}>
        <div className="flex items-center gap-2">
          <Shield className="text-cyan-500 w-6 h-6" />
          <span className="text-xs tracking-widest font-bold">ALETHEIA v1.0.4</span>
        </div>
        <div className="text-[10px] text-zinc-500">
          {isModelsLoaded ? 'NODE_ACTIVE' : 'INITIALIZING...'}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full aspect-[3/4] max-w-sm border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
        />
        
        {/* UI Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 scan-line bg-cyan-500/10 h-1/4"></div>
          
          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50"></div>

          {/* Face Box Simulation */}
          {currentFace && (
            <div 
              className="absolute border border-cyan-400/30 transition-all duration-75"
              style={{
                left: `${(currentFace.detection.box.x / videoRef.current!.videoWidth) * 100}%`,
                top: `${(currentFace.detection.box.y / videoRef.current!.videoHeight) * 100}%`,
                width: `${(currentFace.detection.box.width / videoRef.current!.videoWidth) * 100}%`,
                height: `${(currentFace.detection.box.height / videoRef.current!.videoHeight) * 100}%`,
              }}
            >
              <div className="absolute -top-6 left-0 text-[8px] text-cyan-400 bg-black/50 px-1">
                SUBJECT_{Math.floor(currentFace.detection.score * 100)}%
              </div>
            </div>
          )}
        </div>

        {/* Result Overlay */}
        {result && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
            {result === 'TRUTH' ? (
              <>
                <CheckCircle2 className="w-24 h-24 text-green-500 mb-4" />
                <div className="text-4xl font-black tracking-widest text-green-500">TRUTH</div>
              </>
            ) : (
              <>
                <XCircle className="w-24 h-24 text-red-500 mb-4" />
                <div className="text-4xl font-black tracking-widest text-red-500">DECEPTION</div>
              </>
            )}
            <button 
              onClick={() => setResult(null)}
              className="mt-12 text-zinc-500 text-xs border border-zinc-800 px-6 py-2 rounded-full active:bg-zinc-900"
            >
              DISMISS_OVERRIDE
            </button>
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
          <div className="text-[10px] text-cyan-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            {currentFace ? 'TARGET_LOCKED' : 'SEARCHING...'}
          </div>
        </div>
      </div>

      {/* Hidden Calibration Tool */}
      {showCalibration && (
        <div className="w-full max-w-sm border border-orange-500/50 bg-orange-500/5 p-4 rounded-xl mb-4 z-20">
          <div className="text-xs text-orange-500 font-bold mb-2">CALIBRATION_NODE</div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-400">
              {ownerDescriptor ? 'SIGNATURE_DETECTED' : 'NO_SIGNATURE'}
            </span>
            <button 
              onClick={calibrateOwner}
              className="bg-orange-500 text-black text-[10px] font-bold px-3 py-1 rounded"
              disabled={!currentFace}
            >
              STORE_BIOMETRICS
            </button>
          </div>
        </div>
      )}

      {/* Stats Panel */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-4 z-10">
        <div className="border border-zinc-800 p-3 rounded-lg bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3 h-3 text-red-500" />
            <span className="text-[10px] text-zinc-400">STRESS_INDEX</span>
          </div>
          <div className="text-lg font-bold">
            {currentFace ? Math.floor(currentFace.expressions.neutral * 100) : '00'}
            <span className="text-[10px] font-normal text-zinc-600 ml-1">%</span>
          </div>
        </div>
        <div className="border border-zinc-800 p-3 rounded-lg bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-1">
            <Fingerprint className="w-3 h-3 text-cyan-500" />
            <span className="text-[10px] text-zinc-400">IDENTITY_LOCK</span>
          </div>
          <div className={cn(
            "text-lg font-bold transition-colors",
            ownerDescriptor && currentFace && FaceService.compareFaces(currentFace.descriptor, ownerDescriptor) 
              ? "text-cyan-400" 
              : "text-zinc-700"
          )}>
            {ownerDescriptor && currentFace && FaceService.compareFaces(currentFace.descriptor, ownerDescriptor) 
              ? 'AUTHORIZED' 
              : 'ENCRYPTED'}
          </div>
        </div>
      </div>

      {/* Interaction Button */}
      <div className="w-full max-w-sm relative">
        <button 
          className="w-full h-16 bg-white text-black font-black tracking-[0.2em] rounded-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          disabled={!isModelsLoaded}
          onClick={handleToss}
        >
          INITIATE_TOSS
        </button>
        
        {/* Secret Indicator (nearly invisible) */}
        <div className={cn(
          "absolute -bottom-4 right-0 w-1.5 h-1.5 rounded-full transition-colors duration-300",
          ownerDescriptor && currentFace && FaceService.compareFaces(currentFace.descriptor, ownerDescriptor) && currentFace.expressions.happy > 0.7
            ? "bg-cyan-500/40" // Armed
            : "bg-zinc-900"     // Idle
        )}></div>
      </div>

      <div className="text-[8px] text-zinc-800 mt-4 tracking-widest">
        SECURE_ENCRYPTION_LAYER_v9.3 // NO_LOGGING_MODE
      </div>
    </div>
  )
}
