import "../styles/styles.css";
import "./globals.js";
import Splide from "@splidejs/splide";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import "@splidejs/splide/dist/css/splide.min.css";
import "../styles/carousel.css";

async function initCarousel() {
  try {
    // Imports
    const imageModules = import.meta.glob("../assets/images/lighting/*.webp", {
      query: "?url",
      import: "default",
    });
    const videoModules = import.meta.glob(
      "../assets/videos/light_*.{webm,mp4}",
      {
        query: "?url",
        import: "default",
      },
    );

    const imageEntries = Object.entries(imageModules);
    const videoEntries = Object.entries(videoModules);

    const imagePromises = imageEntries.map(([_, importFn]) => importFn());
    const videoPromises = videoEntries.map(([_, importFn]) => importFn());

    const imageURLs = await Promise.all(imagePromises);
    const videoURLs = await Promise.all(videoPromises);

    // Build slides
    const slideList = document.querySelector(".splide__list");
    const mediaURLs = [];
    let imageIndex = 0;
    let videoIndex = 0;

    while (imageIndex < imageURLs.length || videoIndex < videoURLs.length) {
      // Add up to 3 images
      for (let i = 0; i < 3 && imageIndex < imageURLs.length; i++) {
        mediaURLs.push(imageURLs[imageIndex]);
        imageIndex++;
      }
      // Add 1 video if available
      if (videoIndex < videoURLs.length) {
        mediaURLs.push(videoURLs[videoIndex]);
        videoIndex++;
      }
    }

    mediaURLs.forEach((url, idx) => {
      const slide = document.createElement("li");
      slide.classList.add("splide__slide");

      const isVideo = url.endsWith(".webm") || url.endsWith(".mp4");

      if (isVideo) {
        const videoEl = document.createElement("video");
        videoEl.src = url;
        videoEl.alt = `Elemento multimedia número ${idx + 1}`;
        videoEl.controls = true;
        videoEl.muted = true;

        slide.appendChild(videoEl);
      } else {
        const imgEl = new Image();
        imgEl.dataset.splideLazy = url;
        imgEl.alt = `Elemento multimedia número ${idx + 1}`;

        slide.appendChild(imgEl);
      }

      slideList.appendChild(slide);
    });

    // Init Splide
    const splide = new Splide(".splide", {
      type: "fade",
      drag: false,
      rewind: true,
      speed: 550,
      height: "100%",
      width: "100%",
      fixedHeight: "min(70dvh, 900px)",
      waitForTransition: true,
      lazyLoad: "nearby",
      updateOnMove: true,
    }).mount();

    // Initialize Plyr for UI, but control playback natively
    const videos = Array.from(document.querySelectorAll("video"));
    videos.forEach((video) => new Plyr(video, { muted: true }));

    const controlVideo = (slide) => {
      const activeVideo = slide.querySelector("video");

      videos.forEach((video) => {
        if (video === activeVideo) {
          video
            .play()
            .catch((error) => console.error("Autoplay was prevented:", error));
        } else {
          video.pause();
        }
      });
    };

    splide.on("moved", (newIndex) => {
      const slide = splide.Components.Slides.getAt(newIndex).slide;
      controlVideo(slide);
    });

    return splide;
  } catch (err) {
    console.log(
      `Failed to initialize carousel for the following reason/s: ${err}`,
    );
  }
}

initCarousel();
