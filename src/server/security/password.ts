import crypto from 'crypto';

const ITERATIONS = 100_000;
const KEYLEN = 32;
const DIGEST = 'sha256';

export async function hash(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const derived = await pbkdf2Async(password, salt, ITERATIONS, KEYLEN, DIGEST);
  return [
    'pbkdf2',
    DIGEST,
    String(ITERATIONS),
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$');
}

export async function compare(
  password: string,
  stored: string
): Promise<boolean> {
  try {
    const [scheme, digest, iterStr, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'pbkdf2' || digest !== DIGEST) return false;
    const iters = Number(iterStr);
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const derived = await pbkdf2Async(
      password,
      salt,
      iters,
      expected.length,
      digest
    );
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function pbkdf2Async(
  password: string,
  salt: Buffer,
  iterations: number,
  keylen: number,
  digest: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keylen,
      digest,
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      }
    );
  });
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
