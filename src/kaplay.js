import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix

export const k = kaplay({
  width: 1280,
  height: 720,
  canvas: document.querySelector("#mycanvas"),
  letterbox: true,
});
