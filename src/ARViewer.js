
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
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const clickable = [];

    targets.forEach((t) => {
      const anchor = mindarThree.addAnchor(t.index);

      const video = document.createElement("video");
      video.src = `${API_BASE}/${t.videoPath}`;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("webkit-playsinline", "true");
      video.preload = "auto";

      let created = false;

      anchor.onTargetFound = async () => {
        try {
          await video.play();

          // ✅ WAIT FOR METADATA (CRITICAL FIX)
          await new Promise((resolve) => {
            if (video.readyState >= 2) resolve();
            else video.onloadedmetadata = resolve;
          });

          if (created) return;
          created = true;

          const ratio = video.videoWidth / video.videoHeight;
          const height = 1;
          const width = height * ratio;

          // 🎥 VIDEO
          const texture = new THREE.VideoTexture(video);
          texture.colorSpace = THREE.SRGBColorSpace;

          const videoPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.DoubleSide,
            })
          );

          anchor.group.add(videoPlane);

          // 🏢 COMPANY NAME
          const canvasTop = document.createElement("canvas");
          canvasTop.width = 1024;
          canvasTop.height = 256;
          const ctxTop = canvasTop.getContext("2d");

          ctxTop.fillStyle = "rgba(0,0,0,0.7)";
          ctxTop.fillRect(0, 0, 1024, 256);

          ctxTop.fillStyle = "white";
          ctxTop.font = "bold 80px Arial";
          ctxTop.textAlign = "center";
          ctxTop.fillText(t.companyName || "", 512, 160);

          const topPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(width, 0.25),
            new THREE.MeshBasicMaterial({
              map: new THREE.CanvasTexture(canvasTop),
              transparent: true,
            })
          );

          topPlane.position.set(0, height / 2 + 0.2, 0.01);
          anchor.group.add(topPlane);

          // 🏢 LOGOS
          if (t.companyLogo) {
            const loader = new THREE.TextureLoader();

            loader.load(`${API_BASE}/${t.companyLogo}`, (logoTexture) => {
              const logoMaterial = new THREE.MeshBasicMaterial({
                map: logoTexture,
                transparent: true,
              });

              const logoSize = height * 0.6;

              const leftLogo = new THREE.Mesh(
                new THREE.PlaneGeometry(logoSize, logoSize),
                logoMaterial
              );
              leftLogo.position.set(-width / 2 - 0.4, 0, 0.01);
              anchor.group.add(leftLogo);

              const rightLogo = new THREE.Mesh(
                new THREE.PlaneGeometry(logoSize, logoSize),
                logoMaterial
              );
              rightLogo.position.set(width / 2 + 0.4, 0, 0.01);
              anchor.group.add(rightLogo);
            });
          }

          // 🔘 VISIT BUTTON
          const canvasBottom = document.createElement("canvas");
          canvasBottom.width = 1024;
          canvasBottom.height = 256;
          const ctxBottom = canvasBottom.getContext("2d");

          ctxBottom.fillStyle = "#00c853";
          ctxBottom.fillRect(150, 40, 724, 170);

          ctxBottom.fillStyle = "white";
          ctxBottom.font = "bold 100px Arial";
          ctxBottom.textAlign = "center";
          ctxBottom.fillText("Visit Us", 512, 170);

          const bottomPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 0.9, 0.4),
            new THREE.MeshBasicMaterial({
              map: new THREE.CanvasTexture(canvasBottom),
              transparent: true,
            })
          );

          bottomPlane.position.set(0, -height / 2 - 0.5, 0.01);
          anchor.group.add(bottomPlane);

          // Bigger hit area
          const hitArea = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 1.2, 0.7),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
            })
          );

          hitArea.position.copy(bottomPlane.position);
          anchor.group.add(hitArea);

          clickable.push({
            mesh: hitArea,
            url: t.companyUrl,
          });

        } catch (err) {
          console.log("Playback blocked:", err);
        }
      };

      anchor.onTargetLost = () => video.pause();
    });

    window.addEventListener("pointerdown", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      clickable.forEach((obj) => {
        const intersects = raycaster.intersectObject(obj.mesh);
        if (intersects.length > 0 && obj.url) {
          window.location.assign(obj.url);
        }
      });
    });

    await mindarThree.start();

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    setStarted(true);
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