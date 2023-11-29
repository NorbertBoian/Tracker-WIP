import { webcrypto as crypto } from "node:crypto";

const AES_CTR = "AES-CTR";

export const aesDecrypt = async (asciiCipherTextAndCounterString: string) => {
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
  const decoder = new TextDecoder();
  const cipherTextAndCounterBuffer = Buffer.from(
    asciiCipherTextAndCounterString,
    "base64",
  );
  const cipherTextAndCounterUint8Array = new Uint8Array(
    cipherTextAndCounterBuffer,
  );
  const cipherTextUint8Array = cipherTextAndCounterUint8Array.slice(0, -16);
  const counterUint8Array = cipherTextAndCounterUint8Array.slice(-16);
  const plainTextArrayBuffer = await crypto.subtle.decrypt(
    {
      name: AES_CTR,
      counter: counterUint8Array,
      length: 64,
    },
    key,
    cipherTextUint8Array,
  );
  const utf8EncodedPlainTextUint8Array = new Uint8Array(plainTextArrayBuffer);
  const plainText = decoder.decode(utf8EncodedPlainTextUint8Array);
  return plainText;
};
