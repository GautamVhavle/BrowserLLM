/**
 * Detects WebGPU hardware capabilities.
 *
 * Detection is opt-in: call `detect()` explicitly (e.g. after user grants
 * permission). Reports GPU vendor, architecture, estimated VRAM, adapter
 * limits, supported features, and browser/platform info.
 */
import { useState, useCallback } from "react";

export interface HardwareInfo {
  webgpuSupported: boolean;
  shaderF16: boolean;
  gpuVendor: string;
  gpuArchitecture: string;
  gpuDescription: string;
  estimatedVRAM: number; // MB
  maxBufferSize: number;
  // Extended limits
  maxComputeWorkgroupSize: number;
  maxComputeInvocationsPerWorkgroup: number;
  maxComputeWorkgroupsPerDimension: number;
  maxTextureDimension2D: number;
  maxBindGroups: number;
  // Features
  supportedFeatures: string[];
  // Platform
  platform: string;
  userAgent: string;
  hardwareConcurrency: number;
  deviceMemory: number; // GB, 0 if unavailable
  // Recommendation
  recommendedTier: "low" | "medium" | "high" | "ultra";
  maxModelSizeMB: number;
  loading: boolean;
  detected: boolean;
  error: string | null;
}

function getRecommendedTier(vramMB: number): "low" | "medium" | "high" | "ultra" {
  if (vramMB >= 12000) return "ultra";
  if (vramMB >= 6000) return "high";
  if (vramMB >= 2500) return "medium";
  return "low";
}

const DEFAULT: HardwareInfo = {
  webgpuSupported: false,
  shaderF16: false,
  gpuVendor: "",
  gpuArchitecture: "",
  gpuDescription: "",
  estimatedVRAM: 0,
  maxBufferSize: 0,
  maxComputeWorkgroupSize: 0,
  maxComputeInvocationsPerWorkgroup: 0,
  maxComputeWorkgroupsPerDimension: 0,
  maxTextureDimension2D: 0,
  maxBindGroups: 0,
  supportedFeatures: [],
  platform: "",
  userAgent: "",
  hardwareConcurrency: 0,
  deviceMemory: 0,
  recommendedTier: "low",
  maxModelSizeMB: 0,
  loading: false,
  detected: false,
  error: null,
};

export function useHardwareDetect() {
  const [info, setInfo] = useState<HardwareInfo>(DEFAULT);

  const detect = useCallback(async () => {
    setInfo((prev) => ({ ...prev, loading: true }));

    // Collect platform info regardless of WebGPU support
    const platform = (navigator as any).userAgentData?.platform ?? navigator.platform ?? "";
    const userAgent = navigator.userAgent;
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 0;
    const deviceMemory = (navigator as any).deviceMemory ?? 0;

    if (!("gpu" in navigator)) {
      setInfo({
        ...DEFAULT,
        platform,
        userAgent,
        hardwareConcurrency,
        deviceMemory,
        loading: false,
        detected: true,
        error: "WebGPU not supported. Use Chrome 113+, Edge 113+, or Safari 18.2+.",
      });
      return;
    }

    try {
      const gpu = (navigator as any).gpu;
      const adapter = await gpu.requestAdapter();
      if (!adapter) {
        setInfo({
          ...DEFAULT,
          platform,
          userAgent,
          hardwareConcurrency,
          deviceMemory,
          loading: false,
          detected: true,
          error: "No WebGPU adapter found. Your GPU may not be supported.",
        });
        return;
      }

      const adapterInfo = adapter.info || {};
      const features = adapter.features as Set<string>;
      const hasF16 = features.has("shader-f16");
      const supportedFeatures = Array.from(features).sort();

      const limits = adapter.limits;
      const maxBuffer = limits?.maxStorageBufferBindingSize ?? 0;
      const vendor = (adapterInfo.vendor ?? "").toLowerCase();
      const arch = (adapterInfo.architecture ?? "").toLowerCase();

      // Estimate VRAM from max buffer size
      let estimatedVRAM = Math.round(
        Math.min(maxBuffer / (1024 * 1024) * 4, 65536)
      );

      // On unified memory architectures (Apple Silicon, some integrated GPUs),
      // maxStorageBufferBindingSize reports a share of system RAM, inflating VRAM.
      // Cap to deviceMemory (system RAM) since GPU memory IS system memory and
      // only ~65-75% is realistically available for GPU workloads.
      const isUnifiedMemory =
        vendor === "apple" ||
        arch.includes("apple") ||
        arch.includes("metal");

      if (isUnifiedMemory && deviceMemory > 0) {
        const unifiedCap = Math.round(deviceMemory * 1024 * 0.65);
        estimatedVRAM = Math.min(estimatedVRAM, unifiedCap);
      } else if (deviceMemory > 0) {
        // For discrete GPUs, VRAM shouldn't exceed system RAM as a sanity check
        const ramCapMB = deviceMemory * 1024;
        estimatedVRAM = Math.min(estimatedVRAM, ramCapMB);
      }

      // Extended limits
      const maxComputeWorkgroupSize = limits?.maxComputeWorkgroupSizeX ?? 0;
      const maxComputeInvocationsPerWorkgroup = limits?.maxComputeInvocationsPerWorkgroup ?? 0;
      const maxComputeWorkgroupsPerDimension = limits?.maxComputeWorkgroupsPerDimension ?? 0;
      const maxTextureDimension2D = limits?.maxTextureDimension2D ?? 0;
      const maxBindGroups = limits?.maxBindGroups ?? 0;

      const recommendedTier = getRecommendedTier(estimatedVRAM);
      // Max model size is roughly ~80% of VRAM to leave room for KV cache
      const maxModelSizeMB = Math.round(estimatedVRAM * 0.8);

      setInfo({
        webgpuSupported: true,
        shaderF16: hasF16,
        gpuVendor: adapterInfo.vendor ?? "Unknown",
        gpuArchitecture: adapterInfo.architecture ?? "Unknown",
        gpuDescription: adapterInfo.description ?? adapterInfo.device ?? "Unknown GPU",
        estimatedVRAM,
        maxBufferSize: maxBuffer,
        maxComputeWorkgroupSize,
        maxComputeInvocationsPerWorkgroup,
        maxComputeWorkgroupsPerDimension,
        maxTextureDimension2D,
        maxBindGroups,
        supportedFeatures,
        platform,
        userAgent,
        hardwareConcurrency,
        deviceMemory,
        recommendedTier,
        maxModelSizeMB,
        loading: false,
        detected: true,
        error: null,
      });
    } catch (err) {
      setInfo({
        ...DEFAULT,
        platform,
        userAgent,
        hardwareConcurrency,
        deviceMemory,
        loading: false,
        detected: true,
        error: `Detection failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }, []);

  return { ...info, detect };
}
