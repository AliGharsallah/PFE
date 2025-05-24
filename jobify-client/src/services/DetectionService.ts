// src/services/DetectionService.ts

import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as poseDetection from '@tensorflow-models/pose-detection';

class DetectionService {
  private faceModel: any = null;
  private poseModel: any = null;

  async initialize() {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('TensorFlow.js initialized with WebGL backend');

      // Initialize face detection
      this.faceModel = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: true,
          maxFaces: 1
        }
      );

      // Initialize pose detection
      this.poseModel = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          multiPoseMaxDimension: 256
        }
      );

      return {
        faceModel: this.faceModel,
        poseModel: this.poseModel
      };
    } catch (error) {
      console.error('Error initializing DetectionService:', error);
      throw error;
    }
  }

  async detectFace(video: HTMLVideoElement) {
    try {
      if (!this.faceModel) return null;
      const faces = await this.faceModel.estimateFaces(video, {
        flipHorizontal: false,
        staticImageMode: false
      });
      return faces;
    } catch (error) {
      console.error('Error detecting face:', error);
      return null;
    }
  }

  async detectPose(video: HTMLVideoElement) {
    try {
      if (!this.poseModel) return null;
      const poses = await this.poseModel.estimatePoses(video, {
        flipHorizontal: false,
        maxPoses: 1
      });
      return poses;
    } catch (error) {
      console.error('Error detecting pose:', error);
      return null;
    }
  }
}

export const detectionService = new DetectionService();