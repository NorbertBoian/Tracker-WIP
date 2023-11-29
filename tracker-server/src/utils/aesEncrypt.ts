import { webcrypto as crypto } from "node:crypto";

const AES_CTR = "AES-CTR";

export const aesEncrypt = async (plainText: string) => {
  const key = await crypto.subtle.importKey(
    "jwk",
    {
      k: process.env.AES_KEY,
      kty: "oct",
    },
    AES_CTR,
    false,
    ["encrypt", "decrypt"],
  );
  const encoder = new TextEncoder();
  const utf8EncodedPlainTextUint8Array = encoder.encode(plainText);
  const counterUint8Array = crypto.getRandomValues(new Uint8Array(16));
  const cipherTextArrayBuffer = await crypto.subtle.encrypt(
    {
      name: AES_CTR,
      counter: counterUint8Array,
      length: 64,
    },
    key,
    utf8EncodedPlainTextUint8Array,
  );
  const cipherTextUint8Array = new Uint8Array(cipherTextArrayBuffer);
  const cipherTextAndCounterUint8Array = new Uint8Array([
    ...cipherTextUint8Array,
    ...counterUint8Array,
  ]);
  const cipherTextAndCounterBuffer = Buffer.from(
    cipherTextAndCounterUint8Array.buffer,
  );
  const asciiCipherTextAndCounterString =
    cipherTextAndCounterBuffer.toString("base64");
  return {
    asciiCipherTextAndCounterString,
  };
};
