/// <reference types="@rsbuild/core/types" />

declare namespace JSX {
  interface IntrinsicElements {
    'ic-spectrum-canvas': import('react').DetailedHTMLProps<
      import('react').HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      renderer?: 'webgl' | 'webgpu';
      'app-state'?: string;
    };
  }
}

/**
 * Imports the SVG file as a React component.
 * @requires [@rsbuild/plugin-svgr](https://npmjs.com/package/@rsbuild/plugin-svgr)
 */
declare module '*.svg?react' {
  import type React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
