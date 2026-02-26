/**
 * Utility functions for handling image URLs and fallback mechanisms.
 */

/**
 * Cleans an image name by removing extra characters and normalizing slashes.
 * @param {string} name - The raw image name from the API.
 * @returns {string} - The cleaned image name.
 */
export const cleanImageName = (name) => {
    if (!name || typeof name !== 'string') return name;
    return name.replace(/^["'\[]+|["'\]]+$/g, '').replace(/\\"/g, '').replace(/\\/g, '/').trim();
};

/**
 * Generates a proper image URL, handling various prefixes and encoding.
 * @param {string} imgName - The raw image name or path.
 * @returns {string} - The processed URL for the image tag.
 */
export const getImageUrl = (imgName) => {
    if (!imgName || typeof imgName !== 'string') return "";
    const cleaned = cleanImageName(imgName);

    if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith('data:')) {
        return cleaned;
    }

    const purePath = cleaned.replace(/^\/+|\/+$/g, '');
    const segments = purePath.split('/');

    const knownPrefixes = ['uploads', 'storage', 'public', 'images', 'api', 'assets', 'img'];
    if (knownPrefixes.includes(segments[0])) {
        const prefix = segments[0];
        const fileName = segments.slice(1).join('/');
        return `/${prefix}/${fileName.split('/').map(s => encodeURIComponent(s)).join('/')}`;
    }

    return `/uploads/${segments.map(s => encodeURIComponent(s)).join('/')}`;
};

/**
 * A central error handler for image loading failures.
 * Attempts several common Laravel/Vite storage paths before falling back to a placeholder.
 * @param {Event} e - The error event from the img tag.
 */
export const handleImageError = (e) => {
    const prefixes = [
        'storage/uploads',
        'storage',
        'uploads',
        'public/storage',
        'public/uploads',
        'api/storage',
        'api/uploads',
        'api/public/storage',
        'api/public/uploads',
        'storage/app/public',
        'public',
        'api',
        'img',
        'images',
        'assets/img'
    ];

    let idx = parseInt(e.target.dataset.fallbackIdx || "0");
    const currentSrc = e.target.src;

    // Deduce filename
    const urlParts = currentSrc.split('/');
    const fileNameWithParams = urlParts[urlParts.length - 1];
    const fileName = fileNameWithParams.split('?')[0];

    // Skip prefixes that are already in the URL to avoid redundant requests
    while (idx < prefixes.length && currentSrc.includes(`/${prefixes[idx]}/`)) {
        idx++;
    }

    if (idx < prefixes.length) {
        const nextPrefix = prefixes[idx];
        e.target.dataset.fallbackIdx = (idx + 1).toString();

        const nextSrc = `/${nextPrefix}${nextPrefix ? '/' : ''}${fileName}`;
        console.log(`Image fallback [${idx}]: ${currentSrc} -> ${nextSrc}`);
        e.target.src = nextSrc;
    } else if (idx === prefixes.length) {
        // Last-ditch effort: filename at root
        e.target.dataset.fallbackIdx = (idx + 1).toString();
        e.target.src = `/${fileName}`;
        console.log(`Image fallback [Root]: /${fileName}`);
    } else {
        // Ultimate fallback: Placeholder
        e.target.onerror = null;
        e.target.src = "https://cdn-icons-png.flaticon.com/512/8847/8847419.png";
        console.warn("All image fallback paths failed for:", fileName);
    }
};
