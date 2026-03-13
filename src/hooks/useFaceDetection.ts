import { useEffect, useRef, useState, useCallback } from "react";

interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

interface FaceDetectionResult {
  landmarks: FaceLandmark[];
  leftEyeOpenness: number;
  rightEyeOpenness: number;
  averageEyeOpenness: number;
  isBlinking: boolean;
  faceDetected: boolean;
  faceDescriptor?: number[];
}

interface UseFaceDetectionOptions {
  onBlink?: () => void;
  onFaceDetected?: (detected: boolean) => void;
  earThreshold?: number;
  alertInterval?: number;
  meshStyle?: {
    dotSize: number;
    lineWidth: number;
    baseColor: string;
    noseColor: string;
    lipsColor: string;
    eyeColor?: string;
    blinkColor?: string;
    eyeDotSize?: number;
    eyeDotCount?: number;
    mouthDotSize?: number;
    mouthDotCount?: number;
    showLines: boolean;
  };
}

// Eye aspect ratio calculation points (MediaPipe Face Mesh indices)
const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];

// Iris and pupil indices for highlighting
const LEFT_IRIS_INDICES = [468, 469, 470, 471, 472];
const RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477];

// Full eye detail indices including top/bottom centers (145, 159, 374, 386) for continuous contour
const LEFT_EYE_DETAIL_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_DETAIL_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// Component indices for differentiation
const NOSE_LANDMARKS = [1, 2, 4, 5, 6, 168, 197, 195, 129, 358, 19, 94, 219, 439];
const LIPS_LANDMARKS = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 185, 40, 39, 37, 0, 267, 269, 270, 409,
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 191, 80, 81, 82, 13, 312, 311, 310, 415
];

// Calculate eye aspect ratio
function calculateEAR(landmarks: FaceLandmark[], eyeIndices: number[]): number {
  const p1 = landmarks[eyeIndices[0]];
  const p2 = landmarks[eyeIndices[1]];
  const p3 = landmarks[eyeIndices[2]];
  const p4 = landmarks[eyeIndices[3]];
  const p5 = landmarks[eyeIndices[4]];
  const p6 = landmarks[eyeIndices[5]];

  const v1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
  const v2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));
  const h = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

  return (v1 + v2) / (2 * h);
}

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseFaceDetectionOptions = {},
) {
  const { onBlink, onFaceDetected, earThreshold = 0.25, alertInterval = 10 } = options;

  // Use refs for options to ensure always getting latest values in callbacks
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceData, setFaceData] = useState<FaceDetectionResult | null>(null);

  const onBlinkRef = useRef(onBlink);
  const onFaceDetectedRef = useRef(onFaceDetected);

  useEffect(() => {
    onBlinkRef.current = onBlink;
  }, [onBlink]);

  useEffect(() => {
    onFaceDetectedRef.current = onFaceDetected;
  }, [onFaceDetected]);

  const faceMeshRef = useRef<any>(null);
  const blinkStateRef = useRef({ wasClosed: false, lastBlinkTime: Date.now() });
  const animationFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  // Draw face mesh on canvas - completely refactored for proper alignment
  const drawFaceMesh = useCallback((landmarks: FaceLandmark[], isBlinkingNow: boolean, isClosedNow: boolean) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get the parent container's actual dimensions
    const parent = canvas.parentElement;
    if (!parent) return;

    const containerWidth = parent.clientWidth;
    const containerHeight = parent.clientHeight;

    // Set canvas internal resolution to match container
    if (canvas.width !== containerWidth || canvas.height !== containerHeight) {
      canvas.width = containerWidth;
      canvas.height = containerHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (!videoWidth || !videoHeight) return;

    // Calculate the scale and offset to match how the video is displayed (object-cover)
    const videoAspect = videoWidth / videoHeight;
    const containerAspect = containerWidth / containerHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (containerAspect > videoAspect) {
      renderWidth = containerWidth;
      renderHeight = containerWidth / videoAspect;
      offsetX = 0;
      offsetY = (containerHeight - renderHeight) / 2;
    } else {
      renderHeight = containerHeight;
      renderWidth = containerHeight * videoAspect;
      offsetX = (containerWidth - renderWidth) / 2;
      offsetY = 0;
    }

    // MediaPipe gives normalized coordinates (0-1)
    const getPos = (landmark: FaceLandmark) => {
      const x = landmark.x * renderWidth + offsetX;
      const y = landmark.y * renderHeight + offsetY;
      return { x, y };
    };

    // Determine colors based on state
    const now = Date.now();
    const timeSinceLastBlink = now - blinkStateRef.current.lastBlinkTime;
    const isFatigued = timeSinceLastBlink > alertInterval * 1000;

    // Base style from meshStyle props or defaults via ref for real-time updates
    const isMobile = containerWidth < 768;
    const meshStyle = optionsRef.current.meshStyle;
    const baseColor = meshStyle?.baseColor || "rgba(45, 212, 191, 0.6)";
    const noseColor = meshStyle?.noseColor || "rgba(99, 102, 241, 0.8)";
    const lipsColor = meshStyle?.lipsColor || "rgba(244, 63, 94, 0.85)";
    
    // Scale factors for mobile
    const sizeScale = isMobile ? 0.8 : 1.0;
    const dpr = (window.devicePixelRatio || 1);
    
    const dotSize = (meshStyle?.dotSize || 1.1) * dpr * sizeScale;
    const lineWidth = (meshStyle?.lineWidth || 1.2) * dpr * sizeScale;
    const showLines = meshStyle?.showLines !== false;

    // Eye and Mouth specific settings
    const eyeDotSize = (meshStyle?.eyeDotSize || 2.0) * dpr * sizeScale;
    const mouthDotSize = (meshStyle?.mouthDotSize || 1.3) * dpr * sizeScale;
    const eyeDotCount = isMobile ? Math.min(meshStyle?.eyeDotCount ?? 16, 12) : (meshStyle?.eyeDotCount ?? 16);
    const mouthDotCount = isMobile ? Math.min(meshStyle?.mouthDotCount ?? 20, 14) : (meshStyle?.mouthDotCount ?? 20);

    // Custom colors for eye and blink status
    const customEyeColor = meshStyle?.eyeColor || "rgba(250, 204, 21, 0.9)";
    const customBlinkColor = meshStyle?.blinkColor || "rgba(255, 69, 0, 0.95)";

    let eyeHighlightColor = customEyeColor;

    if (isFatigued) {
      eyeHighlightColor = "rgba(239, 68, 68, 0.95)"; // Red for fatigue kept as safety
    } else if (isBlinkingNow || isClosedNow) {
      // FIX: Apply blink color even when eyes are closed or just blinked
      eyeHighlightColor = customBlinkColor;
    }
    // Fast lookup for sets
    const eyeLandmarks = [...LEFT_EYE_DETAIL_INDICES, ...RIGHT_EYE_DETAIL_INDICES];
    const irisLandmarks = [...LEFT_IRIS_INDICES, ...RIGHT_IRIS_INDICES];

    // Sub-sample eye and mouth landmarks based on count
    const subSample = (indices: number[], targetCount: number) => {
      if (targetCount >= indices.length) return indices;
      if (targetCount <= 0) return [];
      const step = indices.length / targetCount;
      const result = [];
      for (let i = 0; i < targetCount; i++) {
        result.push(indices[Math.floor(i * step)]);
      }
      return result;
    };

    const sampledEyeIndices = subSample(eyeLandmarks, eyeDotCount * 2); // Count per eye or total? Let's assume per eye if it's small, otherwise total. The prompt said "调节网格点的大小、数量".
    const sampledLipsIndices = subSample(LIPS_LANDMARKS, mouthDotCount);

    const eyeIndicesSet = new Set(sampledEyeIndices);
    const noseSet = new Set(NOSE_LANDMARKS);
    const lipsSet = new Set(sampledLipsIndices);

    // Filter out these special landmarks from the base mesh to avoid double-drawing
    const specialIndices = new Set([...eyeLandmarks, ...irisLandmarks, ...NOSE_LANDMARKS, ...LIPS_LANDMARKS]);

    // Draw all landmarks
    // Reduced density for mobile
    const skipFactor = isMobile ? 3 : 1; 
    for (let i = 0; i < landmarks.length; i += skipFactor) {
      if (specialIndices.has(i)) continue;

      const pos = getPos(landmarks[i]);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, dotSize, 0, 2 * Math.PI);
      ctx.fillStyle = baseColor;
      ctx.fill();
    }

    // Draw Nose landmarks
    noseSet.forEach(idx => {
      if (!landmarks[idx]) return;
      const pos = getPos(landmarks[idx]);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, dotSize + 0.3, 0, 2 * Math.PI);
      ctx.fillStyle = noseColor;
      ctx.fill();
    });

    // Draw Lips landmarks
    lipsSet.forEach(idx => {
      if (!landmarks[idx]) return;
      const pos = getPos(landmarks[idx]);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, mouthDotSize, 0, 2 * Math.PI);
      ctx.fillStyle = lipsColor;
      ctx.fill();
    });

    // Draw eye landmarks with special coloring
    eyeIndicesSet.forEach(idx => {
      if (!landmarks[idx]) return;
      const pos = getPos(landmarks[idx]);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, eyeDotSize, 0, 2 * Math.PI);
      ctx.fillStyle = eyeHighlightColor;
      ctx.fill();
    });

    // Subtly draw the outer contour with slightly more weight
    if (showLines) {
      const FACE_OVAL_INDICES = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
        400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
        54, 103, 67, 109,
      ];

      ctx.beginPath();
      ctx.strokeStyle = baseColor.replace(/[\d.]+\)$/g, "0.25)"); // Slightly more transparent than dots
      ctx.lineWidth = lineWidth;
      FACE_OVAL_INDICES.forEach((idx, i) => {
        const pos = getPos(landmarks[idx]);
        if (i === 0) ctx.moveTo(pos.x, pos.y);
        else ctx.lineTo(pos.x, pos.y);
      });
      ctx.closePath();
      ctx.stroke();
    }
  }, [canvasRef, videoRef, alertInterval]); // Removed options.meshStyle from dependencies to avoid recreation but we'll use ref if needed

  const drawFaceMeshRef = useRef(drawFaceMesh);
  useEffect(() => {
    drawFaceMeshRef.current = drawFaceMesh;
  }, [drawFaceMesh]);

  // Initialize Face Mesh - only called when needed
  const initializeFaceMesh = useCallback(async () => {
    if (faceMeshRef.current) return true;
    if (isLoading) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Check if FaceMesh is already loaded
      // @ts-ignore
      if (window.FaceMesh) {
        // @ts-ignore
        const faceMesh = new window.FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.7, // Increased for better stability
          minTrackingConfidence: 0.7,  // Increased for better stability
        });

        faceMesh.onResults((results: any) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;

          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            const landmarks = results.multiFaceLandmarks[0];

            const leftEAR = calculateEAR(landmarks, LEFT_EYE_INDICES);
            const rightEAR = calculateEAR(landmarks, RIGHT_EYE_INDICES);
            const averageEAR = (leftEAR + rightEAR) / 2;

            const currentThreshold = optionsRef.current.earThreshold ?? 0.25;
            const isEyeClosed = averageEAR < currentThreshold;
            const now = Date.now();

            let isBlinking = false;
            if (isEyeClosed && !blinkStateRef.current.wasClosed) {
              blinkStateRef.current.wasClosed = true;
            } else if (!isEyeClosed && blinkStateRef.current.wasClosed) {
              blinkStateRef.current.wasClosed = false;
              if (now - blinkStateRef.current.lastBlinkTime > 150) {
                isBlinking = true;
                blinkStateRef.current.lastBlinkTime = now;
                onBlinkRef.current?.();
              }
            }

            setFaceData({
              landmarks,
              leftEyeOpenness: leftEAR,
              rightEyeOpenness: rightEAR,
              averageEyeOpenness: averageEAR,
              isBlinking,
              faceDetected: true,
              faceDescriptor: generateDescriptor(landmarks),
            });
            onFaceDetectedRef.current?.(true);

            // Determine if eyes are currently closed (for visual feedback)
            const isClosed = leftEAR < currentThreshold || rightEAR < currentThreshold;

            // Draw face mesh using ref for latest drawing logic
            drawFaceMeshRef.current(landmarks, isBlinking, isClosed);
          } else {
            setFaceData({
              landmarks: [],
              leftEyeOpenness: 0,
              rightEyeOpenness: 0,
              averageEyeOpenness: 0,
              isBlinking: false,
              faceDetected: false,
            });
            onFaceDetected?.(false);

            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
          }

          isProcessingRef.current = false;
        });

        faceMeshRef.current = faceMesh;
        setIsInitialized(true);
        setIsLoading(false);
        return true;
      }

      // Load MediaPipe Face Mesh from CDN
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
      script.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Face Mesh"));
        document.head.appendChild(script);
      });

      // @ts-ignore
      if (!window.FaceMesh) {
        throw new Error("Face Mesh not available");
      }

      // Retry initialization after script load
      return initializeFaceMesh();
    } catch (err) {
      console.error("Face Mesh initialization error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize face detection",
      );
      setIsLoading(false);
      return false;
    }
  }, [canvasRef, onBlink, onFaceDetected, earThreshold, isLoading, drawFaceMesh]);

  // Generate a simple face descriptor using normalized landmarks
  const generateDescriptor = (landmarks: FaceLandmark[]): number[] => {
    // We'll pick some key stable landmarks for a basic "signature"
    // This is not as robust as a true embedding but works for local recognition
    // Using eye centers, nose tip, mouth corners, and jaw points
    const keyIndices = [1, 33, 263, 61, 291, 10, 152];
    const descriptor: number[] = [];
    
    // Normalize based on head size (width between eyes)
    const eyeDist = Math.sqrt(
      Math.pow(landmarks[33].x - landmarks[263].x, 2) + 
      Math.pow(landmarks[33].y - landmarks[263].y, 2)
    ) || 0.1;

    const basePoint = landmarks[1]; // Nose tip

    keyIndices.forEach(idx => {
      const p = landmarks[idx];
      // Store relative distance and angle from nose tip, normalized by eye distance
      const dx = (p.x - basePoint.x) / eyeDist;
      const dy = (p.y - basePoint.y) / eyeDist;
      descriptor.push(dx, dy);
    });
    
    return descriptor;
  };

  // Start camera
  const startCamera = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    // Initialize FaceMesh first
    const initialized = await initializeFaceMesh();
    if (!initialized) {
      setError(
        "Failed to initialize face detection. Please refresh and try again.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 60, min: 30 },
          facingMode: "user",
        },
        audio: false,
      });

      video.srcObject = stream;
      await video.play();

      // Wait for video to be ready with a timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (video.readyState >= 2) resolve();
          else reject(new Error("Camera timed out"));
        }, 5000);

        if (video.readyState >= 2) {
          clearTimeout(timeout);
          resolve();
        } else {
          video.onloadeddata = () => {
            clearTimeout(timeout);
            resolve();
          };
        }
      });

      // Start processing frames
      const processFrame = async () => {
        if (video.readyState >= 2 && faceMeshRef.current) {
          try {
            await faceMeshRef.current.send({ image: video });
          } catch (e) {
            console.error("Frame processing error:", e);
          }
        }
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      processFrame();
    } catch (err) {
      console.error("Camera error:", err);
      setError(err instanceof Error ? err.message : "Failed to access camera");
    }
  }, [videoRef, initializeFaceMesh]);

  // Stop camera
  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Reset face data
    setFaceData(null);
    blinkStateRef.current = { wasClosed: false, lastBlinkTime: 0 };

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [videoRef, canvasRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Stop any active camera
      const video = videoRef.current;
      if (video) {
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    };
  }, [videoRef]);

  return {
    isInitialized,
    isLoading,
    error,
    faceData,
    startCamera,
    stopCamera,
  };
}

export type { FaceDetectionResult, FaceLandmark };
