import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import ChromeDinoGame from "react-chrome-dino";
import "./app.css";

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const prevShoulderRef = useRef(null);

  useEffect(() => {
    window.focus(); // ensure window is focused for key events

    // Pose setup
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (results.poseLandmarks) {
        const leftShoulder = results.poseLandmarks[11];
        const avgShoulderY = leftShoulder.y;

        if (prevShoulderRef.current !== null) {
          const diff = prevShoulderRef.current - avgShoulderY;
          if (diff > 0.05) {
            simulateSpacebar();
            console.log("Jump detected!");
          }
        }

        prevShoulderRef.current = avgShoulderY;
      }
    });

    // Start the camera
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

  // Function to simulate spacebar press
  function simulateSpacebar() {
    const downEvent = new KeyboardEvent("keydown", {
      key: " ",
      code: "Space",
      keyCode: 32,
      which: 32,
      bubbles: true,
    });

    const upEvent = new KeyboardEvent("keyup", {
      key: " ",
      code: "Space",
      keyCode: 32,
      which: 32,
      bubbles: true,
    });

    document.dispatchEvent(downEvent);
    setTimeout(() => {
      document.dispatchEvent(upEvent);
    }, 100);
  }

  return (
    <>
      <div className="flex-center">
        <video
          ref={videoRef}
          style={{ display: "none" }}
          className="videobox"
        />
        <canvas
          ref={canvasRef}
          width="200"
          height="200"
          className="canvasCam"
        />
      </div>
      <ChromeDinoGame className="gameCanvas" />
      <div className="banner">
        <h1>
          Made with ❤️ by{" "}
          <a href="https://www.linkedin.com/in/adarrrrsh/">
            Adarsh Pratap Singh
          </a>
        </h1>
      </div>
    </>
  );
};

export default App;
