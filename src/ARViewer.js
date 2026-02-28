

// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
// import { API_BASE } from "./config";

// export default function ARViewer() {
//   const containerRef = useRef(null);
//   const startedRef = useRef(false);

//   useEffect(() => {
//     if (startedRef.current) return;
//     startedRef.current = true;

//     const start = async () => {
//       let targets = [];

//       /* ================= FETCH TARGETS ================= */
//       try {
//         const res = await fetch(`${API_BASE}/api/targets`);
//         targets = await res.json();
//       } catch (err) {
//         console.error("Backend not reachable:", err);
//         return;
//       }

//       /* ================= INIT MINDAR ================= */
//       const mindarThree = new MindARThree({
//         container: containerRef.current,
//         imageTargetSrc: `${API_BASE}/mind/targets.mind`,
//         uiScanning: "no",
//         filterMinCF: 0.001,
//         filterBeta: 0.01,
//       });

//       const { renderer, scene, camera } = mindarThree;

//       const raycaster = new THREE.Raycaster();
//       raycaster.params.Mesh.threshold = 0.2; // 🔥 more sensitive

//       const mouse = new THREE.Vector2();
//       const clickableObjects = [];
//       const smoothedObjects = [];

//       /* ================= CREATE TARGETS ================= */
//       targets.forEach((t) => {
//         const anchor = mindarThree.addAnchor(t.index);

//         const video = document.createElement("video");
//         video.src = `${API_BASE}/${t.videoPath}`;
//         video.crossOrigin = "anonymous";
//         video.loop = true;
//         video.playsInline = true;
//         video.preload = "auto";

//         video.addEventListener("loadedmetadata", () => {
//           const ratio = video.videoWidth / video.videoHeight;
//           const height = 1;
//           const width = height * ratio;

//           /* ========= VIDEO ========= */
//           const texture = new THREE.VideoTexture(video);
//           texture.colorSpace = THREE.SRGBColorSpace;

//           const videoPlane = new THREE.Mesh(
//             new THREE.PlaneGeometry(width, height),
//             new THREE.MeshBasicMaterial({
//               map: texture,
//               side: THREE.DoubleSide,
//             })
//           );

//           anchor.group.add(videoPlane);

//           /* ========= COMPANY NAME ========= */
//           const canvasTop = document.createElement("canvas");
//           canvasTop.width = 1024;
//           canvasTop.height = 256;
//           const ctxTop = canvasTop.getContext("2d");

//           ctxTop.fillStyle = "rgba(0,0,0,0.7)";
//           ctxTop.fillRect(0, 0, 1024, 256);

//           ctxTop.fillStyle = "white";
//           ctxTop.font = "bold 80px Arial";
//           ctxTop.textAlign = "center";
//           ctxTop.fillText(t.companyName || "", 512, 160);

//           const topPlane = new THREE.Mesh(
//             new THREE.PlaneGeometry(width, 0.25),
//             new THREE.MeshBasicMaterial({
//               map: new THREE.CanvasTexture(canvasTop),
//               transparent: true,
//             })
//           );

//           topPlane.position.set(0, height / 2 + 0.2, 0.01);
//           anchor.group.add(topPlane);

//           /* ========= LOGOS ========= */
//           if (t.companyLogo) {
//             const logoTexture = new THREE.TextureLoader().load(
//               `${API_BASE}/${t.companyLogo}`
//             );

//             const logoMaterial = new THREE.MeshBasicMaterial({
//               map: logoTexture,
//               transparent: true,
//             });

//             const logoSize = height * 0.6;

//             const leftLogo = new THREE.Mesh(
//               new THREE.PlaneGeometry(logoSize, logoSize),
//               logoMaterial
//             );

//             leftLogo.position.set(-width / 2 - 0.4, 0, 0.01);
//             anchor.group.add(leftLogo);

//             const rightLogo = new THREE.Mesh(
//               new THREE.PlaneGeometry(logoSize, logoSize),
//               logoMaterial
//             );

//             rightLogo.position.set(width / 2 + 0.4, 0, 0.01);
//             anchor.group.add(rightLogo);
//           }

//           /* ========= VISIT BUTTON ========= */
//           const canvasBottom = document.createElement("canvas");
//           canvasBottom.width = 1024;
//           canvasBottom.height = 256;
//           const ctxBottom = canvasBottom.getContext("2d");

//           ctxBottom.fillStyle = "#00c853";
//           ctxBottom.fillRect(200, 50, 624, 150);

//           ctxBottom.fillStyle = "white";
//           ctxBottom.font = "bold 90px Arial";
//           ctxBottom.textAlign = "center";
//           ctxBottom.fillText("Visit Us", 512, 150);

//           const bottomPlane = new THREE.Mesh(
//             new THREE.PlaneGeometry(width * 0.9, 0.4),
//             new THREE.MeshBasicMaterial({
//               map: new THREE.CanvasTexture(canvasBottom),
//               transparent: true,
//             })
//           );

//           bottomPlane.position.set(0, -height / 2 - 0.45, 0.01);
//           anchor.group.add(bottomPlane);

//           /* 🔥 BIGGER INVISIBLE HIT AREA */
//           const hitArea = new THREE.Mesh(
//             new THREE.PlaneGeometry(width * 1.2, 0.7),
//             new THREE.MeshBasicMaterial({
//               transparent: true,
//               opacity: 0,
//             })
//           );

//           hitArea.position.copy(bottomPlane.position);
//           anchor.group.add(hitArea);

//           clickableObjects.push({
//             mesh: hitArea,
//             url: t.companyUrl,
//           });

//           /* ========= SMOOTHING ========= */
//           smoothedObjects.push({
//             anchor,
//             group: anchor.group,
//             position: new THREE.Vector3(),
//             quaternion: new THREE.Quaternion(),
//           });
//         });

//         anchor.onTargetFound = () => {
//           video.play().catch(() => { });
//         };

//         anchor.onTargetLost = () => {
//           video.pause();
//         };
//       });

//       /* ================= MOBILE FRIENDLY CLICK ================= */
//       window.addEventListener("pointerdown", (event) => {
//         mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//         mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//         raycaster.setFromCamera(mouse, camera);

//         clickableObjects.forEach((obj) => {
//           const intersects = raycaster.intersectObject(obj.mesh);
//           if (intersects.length > 0 && obj.url) {
//             window.open(obj.url, "_blank");
//           }
//         });
//       });

//       /* ================= START AR ================= */
//       await mindarThree.start();

//       renderer.setAnimationLoop(() => {
//         smoothedObjects.forEach((item) => {
//           if (!item.anchor.group.visible) return;

//           item.position.lerp(item.anchor.group.position, 0.08);
//           item.group.position.copy(item.position);

//           item.quaternion.slerp(item.anchor.group.quaternion, 0.08);
//           item.group.quaternion.copy(item.quaternion);
//         });

//         renderer.render(scene, camera);
//       });

//       console.log("✅ AR Started - Ultra Stable Mobile Mode");
//     };

//     start();
//   }, []);

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         width: "100vw",
//         height: "100vh",
//         position: "fixed",
//         top: 0,
//         left: 0,
//         background: "black",
//       }}
//     />
//   );
// }



import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { API_BASE } from "./config";

export default function ARViewer() {
  const containerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = async () => {
      let targets = [];

      /* ================= FETCH TARGETS ================= */
      try {
        const res = await fetch(`${API_BASE}/api/targets`);
        targets = await res.json();
      } catch (err) {
        console.error("Backend not reachable:", err);
        return;
      }

      /* ================= INIT MINDAR ================= */
      const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: `${API_BASE}/mind/targets.mind`,
        uiScanning: "no",
        filterMinCF: 0.001,
        filterBeta: 0.01,
      });

      const { renderer, scene, camera } = mindarThree;

      const raycaster = new THREE.Raycaster();
      raycaster.params.Mesh.threshold = 0.2;

      const mouse = new THREE.Vector2();
      const clickableObjects = [];
      const smoothedObjects = [];

      /* ================= CREATE TARGETS ================= */
      targets.forEach((t) => {
        const anchor = mindarThree.addAnchor(t.index);

        const video = document.createElement("video");
        video.src = `${API_BASE}/${t.videoPath}`;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";

        video.addEventListener("loadedmetadata", () => {
          const ratio = video.videoWidth / video.videoHeight;
          const height = 1;
          const width = height * ratio;

          /* ========= VIDEO ========= */
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

          /* ========= COMPANY NAME ========= */
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

          /* ========= LOGOS ========= */
          if (t.companyLogo) {
            const logoTexture = new THREE.TextureLoader().load(
              `${API_BASE}/${t.companyLogo}`
            );

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
          }

          /* ========= VISIT BUTTON ========= */
          const canvasBottom = document.createElement("canvas");
          canvasBottom.width = 1024;
          canvasBottom.height = 256;
          const ctxBottom = canvasBottom.getContext("2d");

          ctxBottom.fillStyle = "#00c853";
          ctxBottom.fillRect(200, 50, 624, 150);

          ctxBottom.fillStyle = "white";
          ctxBottom.font = "bold 90px Arial";
          ctxBottom.textAlign = "center";
          ctxBottom.fillText("Visit Us", 512, 150);

          const bottomPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 0.9, 0.4),
            new THREE.MeshBasicMaterial({
              map: new THREE.CanvasTexture(canvasBottom),
              transparent: true,
            })
          );

          bottomPlane.position.set(0, -height / 2 - 0.45, 0.01);
          anchor.group.add(bottomPlane);

          /* 🔥 BIGGER INVISIBLE HIT AREA */
          const hitArea = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 1.2, 0.7),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
            })
          );

          hitArea.position.copy(bottomPlane.position);
          anchor.group.add(hitArea);

          clickableObjects.push({
            mesh: hitArea,
            url: t.companyUrl,
          });

          /* ========= SMOOTHING ========= */
          smoothedObjects.push({
            anchor,
            group: anchor.group,
            position: new THREE.Vector3(),
            quaternion: new THREE.Quaternion(),
          });
        });

        anchor.onTargetFound = () => {
          video.play().catch(() => { });
        };

        anchor.onTargetLost = () => {
          video.pause();
        };
      });

      /* ================= IOS SAFE TOUCH HANDLER ================= */
      window.addEventListener("pointerdown", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        clickableObjects.forEach((obj) => {
          const intersects = raycaster.intersectObject(obj.mesh);
          if (intersects.length > 0 && obj.url) {
            // 🔥 Safari safe redirect
            window.location.assign(obj.url);
          }
        });
      });

      /* ================= START AR ================= */
      await mindarThree.start();

      renderer.setAnimationLoop(() => {
        smoothedObjects.forEach((item) => {
          if (!item.anchor.group.visible) return;

          item.position.lerp(item.anchor.group.position, 0.08);
          item.group.position.copy(item.position);

          item.quaternion.slerp(item.anchor.group.quaternion, 0.08);
          item.group.quaternion.copy(item.quaternion);
        });

        renderer.render(scene, camera);
      });

      console.log("✅ AR Started - iOS & Android Safe Mode");
    };

    start();
  }, []);

  return (
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
  );
}