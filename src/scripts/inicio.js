import "../styles/styles.css";
import "./globals.js";
import "../styles/inicio.css";
import harp_08 from "../audio/harp_08.mp3";
import harp_13 from "../audio/harp_13.mp3";

import { aboutCtaButtonHandling } from "./utils.js";

aboutCtaButtonHandling();

const servicesCtaButton = document.querySelectorAll(".services-cta-button");

// "Shine" button differential animation
servicesCtaButton.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    el.classList.remove("shin-e-mated-reverse");
    el.classList.add("shin-e-mated");
  });

  el.addEventListener("mouseleave", () => {
    el.classList.remove("shin-e-mated");
    el.classList.add("shin-e-mated-reverse");
  });
});

// Trailing gradient FX
const aboutUsColumns = document.querySelectorAll(".about-us-column");

aboutUsColumns.forEach((column) => {
  let mouseX = 0;
  let mouseY = 0;
  let gradientX1 = 270;
  let gradientY1 = 270;
  let gradientX2 = 270;
  let gradientY2 = 270;
  let gradientX3 = 270;
  let gradientY3 = 270;
  let animationFrameId = null;

  const updateGradient = () => {
    const dx1 = mouseX - gradientX1;
    const dy1 = mouseY - gradientY1;
    const dx2 = mouseX - gradientX2;
    const dy2 = mouseY - gradientY2;
    const dx3 = mouseX - gradientX3;
    const dy3 = mouseY - gradientY3;

    gradientX1 += dx1 * 0.03;
    gradientY1 += dy1 * 0.03;
    gradientX2 += dx2 * 0.06;
    gradientY2 += dy2 * 0.06;
    gradientX3 += dx3 * 0.09;
    gradientY3 += dy3 * 0.09;

    column.style.setProperty("--mouse-x-1", `${gradientX1}px`);
    column.style.setProperty("--mouse-y-1", `${gradientY1}px`);
    column.style.setProperty("--mouse-x-2", `${gradientX2}px`);
    column.style.setProperty("--mouse-y-2", `${gradientY2}px`);
    column.style.setProperty("--mouse-x-3", `${gradientX3}px`);
    column.style.setProperty("--mouse-y-3", `${gradientY3}px`);

    if (Math.abs(dx1) > 1 || Math.abs(dy1) > 1) {
      animationFrameId = requestAnimationFrame(updateGradient);
    } else {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  column.addEventListener("mouseenter", () => {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updateGradient);
    }
  });

  column.addEventListener("mousemove", (e) => {
    const rect = column.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updateGradient);
    }
  });

  column.addEventListener("mouseleave", () => {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  });
});

// Custom implementation of Underline.js on .about-us-title
class GuitarString {
  constructor(ctx, startPoint, endPoint, strokeWidth, strokeColor, ratio) {
    this.ctx = ctx;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.strokeWidth = strokeWidth;
    this.strokeColor = strokeColor;
    this.ratio = ratio;

    this.maxGrabDistance = this.strokeWidth * 5;
    this.maxControlDistance = this.strokeWidth * 16;

    this.waveCount = 0;
    this.damping = 0.9;
    this.thirdPoint = {
      x: (this.startPoint.x + this.endPoint.x) / 2,
      y: this.startPoint.y,
    };

    this.userInControl = false;
    this.waveInControl = false;
    this.waveFinished = false;
    this.redrawActive = false;

    this.currentMouseX = 0;
    this.currentMouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
  }

  handleMouseMove(e, rect) {
    this.lastMouseX = this.currentMouseX;
    this.lastMouseY = this.currentMouseY;
    this.currentMouseX = (e.clientX - rect.left) * this.ratio;
    this.currentMouseY = (e.clientY - rect.top) * this.ratio;

    const distance = Math.abs(this.currentMouseY - this.startPoint.y);
    const isOverLine =
      this.currentMouseX > this.startPoint.x &&
      this.currentMouseX < this.endPoint.x;

    if (distance < this.maxGrabDistance && isOverLine && !this.userInControl) {
      this.userInControl = true;
      this.waveInControl = false;
      this.redrawActive = true;
    } else if (distance > this.maxControlDistance && this.userInControl) {
      this.userInControl = false;
      this.waveInControl = true;
      this.waveCount = 0;
      this.playSound("audio-up");
    }

    if (this.userInControl) {
      this.thirdPoint = { x: this.currentMouseX, y: this.currentMouseY };
    }
  }

  handleMouseLeave() {
    if (this.userInControl) {
      this.userInControl = false;
      this.waveInControl = true;
      this.waveCount = 0;
      this.playSound("audio-down");
    }
  }

  playSound(soundId) {
    const audio = document.getElementById(soundId);
    if (audio) {
      const newAudio = audio.cloneNode();
      newAudio.play();
    }
  }

  update() {
    if (this.waveInControl) {
      const waveY =
        this.startPoint.y +
        (this.thirdPoint.y - this.startPoint.y) *
          Math.cos((this.waveCount / 5) * Math.PI) *
          Math.pow(this.damping, this.waveCount);

      if (Math.pow(this.damping, this.waveCount) > 0.03) {
        this.thirdPoint = { x: this.thirdPoint.x, y: waveY };
        this.waveCount++;
      } else {
        this.waveInControl = false;
        this.waveFinished = true;
        this.redrawActive = false;
        this.thirdPoint = {
          x: (this.startPoint.x + this.endPoint.x) / 2,
          y: this.startPoint.y,
        };
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.strokeStyle = this.strokeColor;

    this.ctx.beginPath();
    this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
    this.ctx.quadraticCurveTo(
      this.thirdPoint.x,
      this.thirdPoint.y,
      this.endPoint.x,
      this.endPoint.y,
    );
    this.ctx.stroke();
  }
}

class SingleUnderline {
  constructor(element) {
    this.element = element;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.setupCanvas();
    this.createUnderline();
    this.animate();
  }

  setupCanvas() {
    const rect = this.element.getBoundingClientRect();
    const styles = window.getComputedStyle(this.element);

    this.ratio = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * this.ratio;
    this.canvas.height = rect.height * this.ratio;
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";
    this.canvas.className = "about-us-title-canvas";

    this.element.style.position = "relative";
    this.element.appendChild(this.canvas);

    this.ctx.scale(this.ratio, this.ratio);
    this.ctx.font = styles.fontSize + " " + styles.fontFamily;
  }

  createUnderline() {
    const rect = this.element.getBoundingClientRect();

    const strokeWidth = Math.max(1.5, window.devicePixelRatio);
    const underlineY = rect.height * 0.85;

    this.string = new GuitarString(
      this.ctx,
      { x: 0, y: underlineY },
      { x: rect.width, y: underlineY },
      strokeWidth,
      "gray",
      this.ratio,
    );

    this.canvas.addEventListener(
      "click",
      () => {
        this.string.playSound("audio-up");
      },
      { once: true },
    );

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.string.handleMouseMove(e, rect);
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.string.handleMouseLeave();
    });
  }

  animate() {
    const loop = () => {
      this.string.update();
      this.string.draw();
      requestAnimationFrame(loop);
    };
    loop();
  }
}

// Initialize underline
const aboutUsTitle = document.querySelector(".about-us-title");
if (aboutUsTitle) {
  // Add audio elements for harp sounds
  const audioContainer = document.createElement("div");
  audioContainer.style.display = "none";
  audioContainer.innerHTML = `
    <audio id="audio-up" src="${harp_08}" preload="auto"></audio>
    <audio id="audio-down" src="${harp_13}" preload="auto"></audio>
  `;
  document.body.appendChild(audioContainer);

  new SingleUnderline(aboutUsTitle);
}
