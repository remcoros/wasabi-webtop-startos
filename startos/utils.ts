import { SubContainerEager, T } from '@start9labs/start-sdk'
import crypto from 'crypto'
import * as fs from 'node:fs/promises'
import path from 'node:path'

export const uiPort = 3000
export const jsonRpcPort = 37128

// The schema version Wasabi writes. The image seeds Config.json claiming 3 while
// its body is already a valid 4, and Wasabi has no decoder that accepts the
// mismatch — so main.ts relabels the seed. Re-check this against
// PersistentConfigManager.DefaultMainNetConfig on every upstream bump.
export const wasabiConfigVersion = 4

// Bitcoin's `generate-rpc-dependent` action rejects anything shorter, and it
// renders the dependent-supplied value read-only, so the user cannot correct it.
export const rpcPasswordLength = 20

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export const generateRpcPassword = (len = rpcPasswordLength) =>
  Array.from(crypto.randomBytes(len))
    .map((b) => chars[b % chars.length])
    .join('')

export const generateRpcUsername = () => 'wasabi_' + generateRpcPassword(6)

/**
 * Copies `src` to `dest` inside the subcontainer unless `dest` already exists.
 * Returns whether it created the file.
 */
export async function ensureFileExists<
  Manifest extends T.SDKManifest,
  Effects extends T.Effects,
>(
  subcontainer: SubContainerEager<Manifest, Effects>,
  src: string,
  dest: string,
) {
  const destPath = `${subcontainer.rootfs}${dest}`
  try {
    await fs.access(destPath, fs.constants.F_OK)
    return false
  } catch {
    await subcontainer.exec([
      'sh',
      '-c',
      `mkdir -p $(dirname ${dest}) && cp ${src} ${dest}`,
    ])
    return true
  }
}

/**
 * Strips a leading UTF-8 BOM, which Wasabi writes and the JSON file models
 * cannot parse. Call it before every `merge` — and only ever `merge` those
 * files: the models declare a handful of keys out of dozens, so a `write`
 * would be a data-loss bug.
 */
export async function removeUtf8BOMCharacter<
  Manifest extends T.SDKManifest,
  Effects extends T.Effects,
>(subcontainer: SubContainerEager<Manifest, Effects>, filePath: string) {
  await subcontainer.exec(['sed', '-i', `1s/^\uFEFF//`, filePath])
}

// LinuxServer proot-apps 0.3.2 copied these files into the persistent home.
// Hashes come from its x86_64/aarch64 release archives; pversion is "0.3.2\n".
// Keep edited files and user-installed tools, including all symlinks and app data.
export async function removeLegacyProotApps(userdir: string) {
  const ownedFiles: Record<string, string[]> = {
    jq: [
      '020468de7539ce70ef1bceaf7cde2e8c4f2ca6c3afb84642aabc5c97d9fc2a0d',
      '6bc62f25981328edd3cfcfe6fe51b073f2d7e7710d7ef7fcdac28d4e384fc3d4',
    ],
    ncat: [
      '2d6068bcf244bce61e3d9f8be6eb7e5a06f5fa51704e136cba204be0843da7ed',
      '8ab71ff1b493211d3b3d24e79240c7cbe1cc2a73ed51cec9785343ac56006c60',
    ],
    proot: [
      '3f42c2f105af337793374c003f4dda169c99964bca8302d4f4eaf1344cf6eb05',
      '344ebdb0aefc5b6f1f86a2cb1c5ca7fb250676452290a83c301f478f54ea31e0',
    ],
    'proot-apps': [
      'b4003cc02992654f5856b0e42f5dcf9ea9b7f55971bcf582c3e24c3c6258a593',
    ],
    pversion: [
      '511a100eedfb9ea66441e5d506392dba2d8aa290f98c4c544c70ae75ec3c3396',
    ],
  }

  const statIfPresent = async (filePath: string) => {
    try {
      return await fs.lstat(filePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
      throw error
    }
  }

  // Do not follow user-created directory links outside this owned path.
  for (const directory of ['.local', '.local/bin']) {
    if (!(await statIfPresent(path.join(userdir, directory)))?.isDirectory()) {
      return
    }
  }

  for (const [name, hashes] of Object.entries(ownedFiles)) {
    const filePath = path.join(userdir, '.local/bin', name)
    if (!(await statIfPresent(filePath))?.isFile()) continue
    const hash = crypto
      .createHash('sha256')
      .update(await fs.readFile(filePath))
      .digest('hex')
    if (hashes.includes(hash)) await fs.unlink(filePath)
  }
}
