import React from 'react';
import BackgroundBlobs, { type BackgroundBlob } from './BackgroundBlobs';

export type CanopyBackgroundVariant =
  | 'default'
  | 'splash'
  | 'login'
  | 'garden'
  | 'journal'
  | 'onboarding-name'
  | 'onboarding-question'
  | 'onboarding-focus'
  | 'onboarding-plant';

type CanopyScreenBackgroundProps = {
  className?: string;
  variant?: CanopyBackgroundVariant;
  noiseOpacity?: number;
  baseColor?: string;
  blobs?: BackgroundBlob[];
};

type BackgroundPreset = {
  baseColor: string;
  noiseOpacity: number;
  blobs: BackgroundBlob[];
};

const defaultBlobs: BackgroundBlob[] = [
  {
    color: 'var(--accent-lilac)',
    width: 180,
    height: 180,
    opacity: 0.45,
    blur: 80,
    top: -42,
    right: -26,
  },
  {
    color: 'var(--accent-lilac-deep)',
    width: 200,
    height: 200,
    opacity: 0.5,
    blur: 100,
    bottom: -60,
    left: -56,
  },
];

const presets: Record<CanopyBackgroundVariant, BackgroundPreset> = {
  default: {
    baseColor: 'var(--bg-base-white)',
    noiseOpacity: 0.07,
    blobs: [
      {
        color: 'var(--accent-blue)',
        width: 172,
        height: 172,
        opacity: 0.62,
        blur: 54,
        top: -30,
        right: -12,
      },
      {
        color: 'var(--accent-purple-bloom-soft)',
        width: 246,
        height: 246,
        opacity: 0.62,
        blur: 78,
        bottom: -108,
        left: -92,
      },
      {
        color: 'var(--bg-base-white)',
        width: 92,
        height: 92,
        opacity: 0.9,
        blur: 24,
        top: 18,
        right: 62,
      },
    ],
  },
  splash: {
    baseColor: 'var(--bg-splash-base)',
    noiseOpacity: 0.085,
    blobs: [
      {
        color: 'var(--accent-indigo-splash)',
        width: 260,
        height: 260,
        opacity: 0.22,
        blur: 96,
        bottom: -128,
        left: -108,
      },
      {
        color: 'var(--accent-indigo-splash-soft)',
        width: 220,
        height: 220,
        opacity: 0.16,
        blur: 108,
        bottom: -120,
        right: -88,
      },
    ],
  },
  login: {
    baseColor: 'var(--bg-base-white)',
    noiseOpacity: 0.068,
    blobs: [
      {
        color: 'var(--accent-purple-bloom-login)',
        width: 248,
        height: 248,
        opacity: 0.8,
        blur: 82,
        bottom: -88,
        left: -110,
      },
      {
        color: 'var(--accent-blue-soft)',
        width: 300,
        height: 300,
        opacity: 0.8,
        blur: 84,
        bottom: -106,
        right: -126,
      },
      {
        color: 'var(--accent-purple-bloom-login-soft)',
        width: 212,
        height: 212,
        opacity: 0.42,
        blur: 82,
        bottom: -108,
        left: '50%',
        transform: 'translateX(-50%)',
      },
      {
        color: 'var(--bg-base-white)',
        width: 106,
        height: 106,
        opacity: 0.98,
        blur: 24,
        bottom: 14,
        left: 18,
      },
      {
        color: 'var(--bg-base-white)',
        width: 102,
        height: 102,
        opacity: 0.96,
        blur: 24,
        bottom: 18,
        right: 18,
      },
      {
        color: 'var(--surface-card-subtle-11)',
        width: 144,
        height: 144,
        opacity: 0.28,
        blur: 54,
        top: 286,
        left: -42,
      },
      {
        color: 'var(--surface-card-subtle-12)',
        width: 156,
        height: 156,
        opacity: 0.26,
        blur: 58,
        top: 334,
        right: -56,
      },
    ],
  },
  garden: {
    baseColor: 'var(--bg-base-white)',
    noiseOpacity: 0.07,
    blobs: [
      {
        color: 'var(--accent-blue)',
        width: 174,
        height: 174,
        opacity: 0.62,
        blur: 54,
        top: -30,
        right: -10,
      },
      {
        color: 'var(--accent-purple-bloom-soft)',
        width: 254,
        height: 254,
        opacity: 0.66,
        blur: 80,
        bottom: -116,
        left: -96,
      },
    ],
  },
  journal: {
    baseColor: 'var(--bg-base-white)',
    noiseOpacity: 0.07,
    blobs: [
      {
        color: 'var(--accent-purple-alt)',
        width: 168,
        height: 168,
        opacity: 0.64,
        blur: 50,
        top: -18,
        right: -10,
      },
      {
        color: 'var(--accent-purple-bloom)',
        width: 264,
        height: 264,
        opacity: 0.7,
        blur: 80,
        bottom: -122,
        left: -102,
      },
      {
        color: 'var(--bg-base-white)',
        width: 100,
        height: 100,
        opacity: 0.94,
        blur: 26,
        top: 12,
        right: 56,
      },
    ],
  },
  'onboarding-name': {
    baseColor: 'var(--bg-base-white)',
    noiseOpacity: 0.07,
    blobs: [
      {
        color: 'var(--accent-purple-deep)',
        width: 196,
        height: 196,
        opacity: 0.66,
        blur: 56,
        top: -34,
        right: -18,
      },
      {
        color: 'var(--accent-purple-bloom-alt)',
        width: 246,
        height: 246,
        opacity: 0.68,
        blur: 78,
        bottom: -118,
        left: -98,
      },
      {
        color: 'var(--accent-purple-mid)',
        width: 238,
        height: 238,
        opacity: 0.58,
        blur: 76,
        bottom: -120,
        right: -92,
      },
      {
        color: 'var(--bg-base-white)',
        width: 104,
        height: 104,
        opacity: 0.96,
        blur: 24,
        bottom: 8,
        right: 22,
      },
    ],
  },
  'onboarding-question': {
    baseColor: 'var(--bg-base-white)',
    noiseOpacity: 0.07,
    blobs: [
      {
        color: 'var(--accent-purple)',
        width: 202,
        height: 202,
        opacity: 0.68,
        blur: 56,
        top: -38,
        right: -24,
      },
      {
        color: 'var(--accent-purple-bloom-mid)',
        width: 252,
        height: 252,
        opacity: 0.72,
        blur: 80,
        bottom: -126,
        left: -102,
      },
    ],
  },
  'onboarding-focus': {
    baseColor: 'var(--bg-base-white)',
    noiseOpacity: 0.07,
    blobs: [
      {
        color: 'var(--accent-purple)',
        width: 202,
        height: 202,
        opacity: 0.68,
        blur: 56,
        top: -38,
        right: -24,
      },
      {
        color: 'var(--accent-purple-bloom-mid)',
        width: 260,
        height: 260,
        opacity: 0.74,
        blur: 80,
        bottom: -126,
        left: -104,
      },
    ],
  },
  'onboarding-plant': {
    baseColor: 'var(--bg-screen-onboarding-plant)',
    noiseOpacity: 0.06,
    blobs: [
      {
        color: 'var(--accent-blue-light)',
        width: 192,
        height: 192,
        opacity: 0.58,
        blur: 48,
        top: -18,
        right: -10,
      },
      {
        color: 'var(--accent-purple-bloom-plant)',
        width: 252,
        height: 252,
        opacity: 0.64,
        blur: 70,
        bottom: -120,
        right: -92,
      },
      {
        color: 'var(--accent-purple-bloom-plant-soft)',
        width: 184,
        height: 184,
        opacity: 0.44,
        blur: 64,
        bottom: -82,
        left: 110,
      },
    ],
  },
};

export default function CanopyScreenBackground({
  className = '',
  variant = 'default',
  noiseOpacity,
  baseColor,
  blobs,
}: CanopyScreenBackgroundProps) {
  const preset = presets[variant];
  const resolvedBaseColor = baseColor ?? preset.baseColor;
  const resolvedNoiseOpacity = noiseOpacity ?? preset.noiseOpacity;
  const resolvedBlobs = blobs ?? preset.blobs;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden canopy-textured-surface ${className}`}
      aria-hidden
      style={{ backgroundColor: resolvedBaseColor }}
    >
      {variant === 'splash' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--bg-gradient-splash-overlay)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--bg-gradient-splash-bloom)',
            }}
          />
        </>
      )}
      {(variant === 'default' ||
        variant === 'garden' ||
        variant === 'journal' ||
        variant === 'onboarding-name' ||
        variant === 'onboarding-question' ||
        variant === 'onboarding-focus') && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--bg-gradient-shell-overlay)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--bg-gradient-shell-wash)',
            }}
          />
        </>
      )}
      {variant === 'onboarding-plant' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--bg-gradient-plant-overlay)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--bg-gradient-plant-bloom)',
            }}
          />
        </>
      )}
      {variant === 'login' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--bg-gradient-login-overlay)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--bg-gradient-login-wash)',
            }}
          />
        </>
      )}
      <BackgroundBlobs blobs={resolvedBlobs} />
      <div
        className="canopy-noise-overlay"
        style={{ ['--canopy-noise-opacity' as string]: resolvedNoiseOpacity }}
      />
    </div>
  );
}
