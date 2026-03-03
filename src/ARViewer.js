
// import { useRef, useState } from "react";
// import * as THREE from "three";
// import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
// import { API_BASE } from "./config";

// export default function ARViewer() {
//   const containerRef = useRef(null);
//   const [started, setStarted] = useState(false);

//   const startAR = async () => {
//     let targets = [];

//     try {
//       const res = await fetch(`${API_BASE}/api/targets`);
//       targets = await res.json();
//     } catch (err) {
//       console.error("Backend not reachable:", err);
//       return;
//     }

//     const mindarThree = new MindARThree({
//       container: containerRef.current,
//       imageTargetSrc: `${API_BASE}/mind/targets.mind`,
//       uiScanning: "no",
//     });

//     const { renderer, scene, camera } = mindarThree;

//     targets.forEach((t) => {
//       const anchor = mindarThree.addAnchor(t.index);

//       const video = document.createElement("video");
//       video.src = `${API_BASE}/${t.videoPath}`;
//       video.crossOrigin = "anonymous";
//       video.loop = true;
//       video.playsInline = true;
//       video.setAttribute("webkit-playsinline", "true");
//       video.preload = "auto";

//       anchor.onTargetFound = async () => {
//         try {
//           await video.play();
//           const texture = new THREE.VideoTexture(video);

//           const ratio = video.videoWidth / video.videoHeight;
//           const height = 1;
//           const width = height * ratio;

//           const plane = new THREE.Mesh(
//             new THREE.PlaneGeometry(width, height),
//             new THREE.MeshBasicMaterial({ map: texture })
//           );

//           anchor.group.add(plane);
//         } catch (err) {
//           console.log("Playback blocked:", err);
//         }
//       };

//       anchor.onTargetLost = () => video.pause();
//     });

//     // 🔥 VERY IMPORTANT
//     await mindarThree.start();  // Start camera FIRST

//     renderer.setAnimationLoop(() => {
//       renderer.render(scene, camera);
//     });

//     setStarted(true);  // Update UI AFTER camera started
//   };

//   return (
//     <>
//       {!started && (
//         <div
//           onClick={startAR}
//           style={{
//             position: "fixed",
//             width: "100vw",
//             height: "100vh",
//             background: "black",
//             color: "white",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             fontSize: "24px",
//             zIndex: 9999,
//             cursor: "pointer",
//           }}
//         >
//           Tap to Start AR
//         </div>
//       )}

//       <div
//         ref={containerRef}
//         style={{
//           width: "100vw",
//           height: "100vh",
//           position: "fixed",
//           top: 0,
//           left: 0,
//           background: "black",
//         }}
//       />
//     </>
//   );
// }



import { useRef, useState } from "react";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { API_BASE } from "./config";

export default function ARViewer() {
  const containerRef = useRef(null);
  const [started, setStarted] = useState(false);

  const startAR = async () => {
    let targets = [];

    try {
      const res = await fetch(`${API_BASE}/api/targets`);
      targets = await res.json();
    } catch (err) {
      console.error("Backend not reachable:", err);
      return;
    }

    const mindarThree = new MindARThree({
      container: containerRef.current,
      imageTargetSrc: `${API_BASE}/mind/targets.mind`,
      uiScanning: "no",
    });

    const { renderer, scene, camera } = mindarThree;

    targets.forEach((t) => {
      const anchor = mindarThree.addAnchor(t.index);

      const video = document.createElement("video");
      video.src = `${API_BASE}/${t.videoPath}`;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("webkit-playsinline", "true");
      video.preload = "auto";

      anchor.onTargetFound = async () => {
        try {
          await video.play();
          const texture = new THREE.VideoTexture(video);

          const ratio = video.videoWidth / video.videoHeight;
          const height = 1;
          const width = height * ratio;

          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({ map: texture })
          );

          anchor.group.add(plane);
        } catch (err) {
          console.log("Playback blocked:", err);
        }
      };

      anchor.onTargetLost = () => video.pause();
    });

    // 🔥 VERY IMPORTANT
    await mindarThree.start();  // Start camera FIRST

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    setStarted(true);  // Update UI AFTER camera started
  };

  return (
    <>
      {!started && (
        <div
          onClick={startAR}
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            background: "black",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "24px",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          Tap to Start AR
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          background: "black",
        }}
      />
    </>
  );
}