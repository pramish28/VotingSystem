import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const FaceCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (err) {
        setError('Failed to load face detection models');
      }
    };
    loadModels();
  }, []);

  const captureFace = async () => {
    if (!webcamRef.current || !modelsLoaded) {
      setError('Webcam or models not ready');
      return;
    }

    const image = webcamRef.current.getScreenshot();
    if (!image) {
      setError('Failed to capture image');
      return;
    }

    const img = await faceapi.fetchImage(image);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setError('No face detected');
      return;
    }

    onCapture(detection.descriptor);
  };

  return (
    <div className="flex flex-col items-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={640}
        height={480}
        className="mb-4"
      />
      <button
        onClick={captureFace}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={!modelsLoaded}
      >
        Capture Face
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default FaceCapture;