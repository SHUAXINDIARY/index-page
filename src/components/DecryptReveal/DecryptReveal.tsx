'use client';

// Source: Canvas UI Decrypt Reveal (MIT), adapted through its official registry.

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  createDecryptReveal,
  supportsHtmlInCanvas,
} from './decryptRevealRuntime';
import type { DecryptRevealInstance, DecryptRevealOptions } from './types';

export type {
  DecryptRevealElements,
  DecryptRevealInstance,
  DecryptRevealOptions,
} from './types';


export interface DecryptRevealProps extends DecryptRevealOptions {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const emptySubscribe = () => () => {};

export function DecryptReveal({
  children,
  className,
  style,
  ...options
}: DecryptRevealProps) {
  const sourceRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<DecryptRevealInstance | null>(null);
  const [initialOptions] = useState(options);
  const [failed, setFailed] = useState(false);

  const supported = useSyncExternalStore(
    emptySubscribe,
    supportsHtmlInCanvas,
    () => false,
  );
  const native = supported && !failed;

  useEffect(() => {
    const source = sourceRef.current;
    const content = contentRef.current;
    const output = outputRef.current;
    if (!native || !source || !content || !output) return;

    let isCurrent = true;
    const instance = createDecryptReveal(
      { source, content, output },
      initialOptions,
    );
    instanceRef.current = instance;
    if (!instance) {
      queueMicrotask(() => {
        if (isCurrent) setFailed(true);
      });
    }

    return () => {
      isCurrent = false;
      instance?.destroy();
      instanceRef.current = null;
    };
  }, [initialOptions, native]);

  useEffect(() => {
    instanceRef.current?.setOptions(options);
  });

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <canvas
        ref={sourceRef}
        // @ts-expect-error experimental html-in-canvas attribute
        layoutsubtree="true"
        suppressHydrationWarning
        style={
          native
            ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
            : { display: 'none' }
        }
      >
        {native ? (
          <div
            ref={contentRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'auto',
            }}
          >
            {children}
          </div>
        ) : null}
      </canvas>
      {!native ? (
        <div
          ref={contentRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      ) : null}
      <canvas
        ref={outputRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default DecryptReveal;
