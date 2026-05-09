import * as faceapi from 'face-api.js';

class FaceService {
  private static instance: FaceService;
  private isModelsLoaded = false;

  private constructor() {}

  public static getInstance(): FaceService {
    if (!FaceService.instance) {
      FaceService.instance = new FaceService();
    }
    return FaceService.instance;
  }

  public async loadModels() {
    if (this.isModelsLoaded) return;
    
    // Use relative path for GitHub Pages compatibility
    const MODEL_URL = './models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    
    this.isModelsLoaded = true;
  }

  public async detectFace(video: HTMLVideoElement) {
    if (!this.isModelsLoaded) return null;

    const options = new faceapi.TinyFaceDetectorOptions();
    const result = await faceapi.detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptor();

    return result;
  }

  public compareFaces(descriptor1: Float32Array, descriptor2: Float32Array) {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    // Usually, a distance < 0.6 is considered a match
    return distance < 0.6;
  }
}

export default FaceService.getInstance();
