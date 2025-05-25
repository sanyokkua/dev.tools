export type EncodeDecodeFunc = (text: string) => Promise<string>;

export enum Encoder {
    BASE64 = 'Encoder_BASE64',
    SHA_1 = 'SHA-1',
    SHA_256 = 'SHA-256',
    SHA_384 = 'SHA-384',
    SHA_512 = 'SHA-512',
}

export enum Decoder {
    BASE64 = 'Decoder_BASE64',
}

function createEncodersMap(): Map<Encoder, EncodeDecodeFunc> {
    const map = new Map<Encoder, EncodeDecodeFunc>();
    map.set(Encoder.BASE64, base64Encode);
    map.set(Encoder.SHA_1, sha1Encode);
    map.set(Encoder.SHA_256, sha256Encode);
    map.set(Encoder.SHA_384, sha384Encode);
    map.set(Encoder.SHA_512, sha512Encode);

    return map;
}

function createDecodersMap(): Map<Decoder, EncodeDecodeFunc> {
    const map = new Map<Decoder, EncodeDecodeFunc>();
    map.set(Decoder.BASE64, base64Decode);
    return map;
}

export const ENCODERS: Map<Encoder, EncodeDecodeFunc> = createEncodersMap();
export const DECODERS: Map<Decoder, EncodeDecodeFunc> = createDecodersMap();

export async function base64Encode(text: string): Promise<string> {
    return Buffer.from(text).toString('base64');
}

export async function base64Decode(base64text: string): Promise<string> {
    return Buffer.from(base64text, 'base64').toString();
}

async function shaEncode(text: string, shaAlg: string): Promise<string> {
    const msgUint8: Uint8Array = new TextEncoder().encode(text); // encode as (utf-8) Uint8Array
    const hashBuffer: ArrayBuffer = await window.crypto.subtle.digest(shaAlg, msgUint8); // hash the message
    const hashArray: number[] = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
}

export async function sha1Encode(text: string): Promise<string> {
    return shaEncode(text, Encoder.SHA_1);
}

export async function sha256Encode(text: string): Promise<string> {
    return shaEncode(text, Encoder.SHA_256);
}

export async function sha384Encode(text: string): Promise<string> {
    return shaEncode(text, Encoder.SHA_384);
}

export async function sha512Encode(text: string): Promise<string> {
    return shaEncode(text, Encoder.SHA_512);
}
