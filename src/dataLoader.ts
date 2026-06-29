import type { ThaiAddressData } from "./types.js";

type BytesLike = ArrayBuffer | ArrayBufferView;

function asUint8Array(input: BytesLike): Uint8Array {
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
}

function looksGzipped(bytes: Uint8Array): boolean {
  return bytes[0] === 0x1f && bytes[1] === 0x8b;
}

async function gunzip(bytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream !== "function") {
    throw new Error("This browser does not support DecompressionStream for gzipped address data.");
  }

  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const body = new Response(buffer).body;
  if (!body) {
    throw new Error("This browser does not expose ReadableStream for gzipped address data.");
  }

  const stream = body.pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

export async function decodeThaiAddressData(input: BytesLike | string): Promise<ThaiAddressData> {
  if (typeof input === "string") {
    return JSON.parse(input) as ThaiAddressData;
  }

  const bytes = asUint8Array(input);
  const json = looksGzipped(bytes) ? await gunzip(bytes) : new TextDecoder().decode(bytes);
  return JSON.parse(json) as ThaiAddressData;
}

export async function loadThaiAddressData(url = "./data/thai-address-core.json.gz"): Promise<ThaiAddressData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load Thai address data from ${url}: ${response.status} ${response.statusText}`);
  }

  return decodeThaiAddressData(await response.arrayBuffer());
}
