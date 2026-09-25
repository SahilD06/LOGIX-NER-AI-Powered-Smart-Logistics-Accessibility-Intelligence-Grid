import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Rakshak NER - Landslide Early Warning & AI Shield</title>
        <meta name="description" content="AI-Powered Landslide Early Warning & Disaster Response System for North East India" />
        <meta name="theme-color" content="#E9E6E7" />

        <ScrollViewStyleReset />

        {/* Google Identity Services SDK */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>

        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />

        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #E9E6E7;
  color: #2C2827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Urban Slate Leaflet popup styling */
.leaflet-popup-content-wrapper {
  background: #ffffff !important;
  color: #2C2827 !important;
  border-radius: 12px !important;
  border: 1px solid #DCD7D8 !important;
  box-shadow: 0 10px 25px -5px rgba(94, 86, 83, 0.15) !important;
}
.leaflet-popup-tip {
  background: #ffffff !important;
}
.leaflet-container {
  background: #E9E6E7 !important;
  font-family: inherit !important;
}

/* Uiverse.io Light/Dark Theme Switch */
.uiverse-switch {
  font-size: 17px;
  position: relative;
  display: inline-block;
  width: 64px;
  height: 34px;
  user-select: none;
  cursor: pointer;
}

.uiverse-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.uiverse-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #73C0FC;
  transition: 0.4s;
  border-radius: 30px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.12);
  display: block;
}

.uiverse-slider:before {
  position: absolute;
  content: "";
  height: 28px;
  width: 28px;
  border-radius: 50%;
  left: 3px;
  bottom: 3px;
  z-index: 2;
  background-color: #e8e8e8;
  box-shadow: 0 2px 5px rgba(0,0,0,0.22);
  transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.uiverse-sun {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.uiverse-sun svg {
  width: 22px;
  height: 22px;
  animation: uiverseRotate 15s linear infinite;
}

.uiverse-moon {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 1;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.uiverse-moon svg {
  fill: #73C0FC;
  width: 22px;
  height: 22px;
  animation: uiverseTilt 5s linear infinite;
}

@keyframes uiverseRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes uiverseTilt {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-12deg);
  }
  75% {
    transform: rotate(12deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.uiverse-switch input:checked + .uiverse-slider {
  background-color: #183153;
}

.uiverse-switch input:focus + .uiverse-slider {
  box-shadow: 0 0 1px #183153;
}

.uiverse-switch input:checked + .uiverse-slider:before {
  transform: translateX(30px);
}
`;
