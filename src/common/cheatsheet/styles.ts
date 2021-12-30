/**
 * Cheatsheet styles
 */

// We could make some wrapper class for this, but we don't have enough .css files for that to
// be worth it.

/**
 * Available css styles for Cheatsheet. Paths are relative to [extensionUri].
 */
export const STYLES = {
    auto: 'media/cheatsheet/cheatsheet-auto.css',
    original: 'media/cheatsheet/cheatsheet-original.css',
};

/** Default style */
export const DEFAULT_STYLE: keyof typeof STYLES = 'auto';
