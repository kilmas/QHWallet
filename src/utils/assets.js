/**
 * Utility function to return corresponding eth-contract-metadata logo
 *
 * @param {string} logo - Logo path from eth-contract-metadata
 */
export default function getAssetLogoPath(logo) {
  if (!logo) return;
  let uri = logo
  if (!/^http(s)?/.test(logo)) {
    uri = `https://raw.githubusercontent.com/metamask/eth-contract-metadata/v1.12.1/images/${logo}`;
  }
  return uri;
}
