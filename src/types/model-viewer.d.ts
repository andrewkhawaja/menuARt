// Type definitions for model-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        alt?: string;
        "auto-rotate"?: boolean;
        "camera-controls"?: boolean;
        ar?: boolean;
        "ar-modes"?: string;
        rel?: string;
        "ios-src"?: string;
        onLoad?: () => void;
        style?: React.CSSProperties;
        "camera-orbit"?: string;
        activateAR?: () => Promise<void>;
        resetTurntable?: () => void;
      };
    }
  }

  interface HTMLModelElement extends HTMLElement {
    src?: string;
    alt?: string;
    "auto-rotate"?: boolean;
    "camera-controls"?: boolean;
    ar?: boolean;
    "ar-modes"?: string;
    rel?: string;
    "ios-src"?: string;
    activateAR?: () => Promise<void>;
    resetTurntable?: () => void;
    cameraOrbit?: string;
  }
}

// This export statement is needed to make this file a module
export {};
