export type ThemeToken = { name: string; value: string };

export function readThemeTokens(css: string) {
  const themeStart = css.indexOf("@theme {");
  const themeEnd = css.indexOf("}", themeStart);
  const themeBody = css.slice(themeStart, themeEnd);

  const tokens: ThemeToken[] = [];
  for (const line of themeBody.split("\n")) {
    const declaration = line.trim();
    if (!declaration.startsWith("--")) {
      continue;
    }
    const separatorIndex = declaration.indexOf(":");
    const name = declaration.slice(0, separatorIndex);
    const value = declaration.slice(separatorIndex + 1, -1).trim();
    tokens.push({ name, value });
  }
  return tokens;
}

export function contrastRatio(firstHex: string, secondHex: string) {
  const firstLuminance = relativeLuminance(firstHex);
  const secondLuminance = relativeLuminance(secondHex);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string) {
  const red = channelLuminance(hex.slice(1, 3));
  const green = channelLuminance(hex.slice(3, 5));
  const blue = channelLuminance(hex.slice(5, 7));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function channelLuminance(hexPair: string) {
  const channel = parseInt(hexPair, 16) / 255;
  if (channel <= 0.03928) {
    return channel / 12.92;
  }
  return ((channel + 0.055) / 1.055) ** 2.4;
}
