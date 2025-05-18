import { T, SubContainer } from '@start9labs/start-sdk'
import crypto from 'crypto'
import * as fs from 'node:fs/promises'
import { promises as dns } from 'dns'

// uiPort
export const uiPort = 3000

// generateRpcPassword
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export const generateRpcPassword = (len = 16) =>
  Array.from(crypto.randomBytes(len))
    .map((b) => chars[b % chars.length])
    .join('')

/*
 * Checks if a file exists at the given path in the subcontainer.
 * If it does not exist, it copies the file from the source path to the destination path.
 */
export async function ensureFileExists(
  subcontainer: SubContainer<T.SDKManifest, T.Effects>,
  src: string,
  dest: string,
) {
  const destPath = `${subcontainer.rootfs}${dest}`
  try {
    await fs.access(destPath, fs.constants.F_OK)
  } catch {
    await subcontainer.exec([
      'sh',
      '-c',
      `mkdir -p $(dirname ${dest}) && cp ${src} ${dest}`,
    ])
  }
}

/*
 * Resolves the IPv4 address of a given hostname.
 * @param hostname - The hostname to resolve.
 * @returns A promise that resolves to the first IPv4 address found for the hostname.
 * @throws An error if no IPv4 address is found or if the resolution fails.
 */
export async function resolveIPv4Address(hostname: string): Promise<string> {
  try {
    const addresses = await dns.resolve4(hostname) // resolves only IPv4 addresses
    if (addresses.length === 0) {
      throw new Error(`No IPv4 address found for hostname: ${hostname}`)
    }
    return addresses[0]
  } catch (error) {
    throw new Error(
      `Failed to resolve IPv4 address for ${hostname}: ${(error as Error).message}`,
    )
  }
}

/*
 * Removes the UTF-8 BOM character from the beginning of a file.
 * @param subcontainer - The subcontainer in which the file resides.
 * @param filePath - The path to the file from which to remove the BOM character.
 */
export async function removeUtf8BOMCharacter(
  subcontainer: SubContainer<T.SDKManifest, T.Effects>,
  filePath: string,
) {
  await subcontainer.exec(['sed', '-i', `1s/^\uFEFF//`, filePath])
}
