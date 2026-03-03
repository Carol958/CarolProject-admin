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
 * Attempts several common Laravel/Vite storage paths while preserving directory structure.
 * @param {Event} e - The error event from the img tag.
 */
export const handleImageError = (e) => {
    const prefixes = [
        'storage',
        'uploads',
        'storage/uploads',
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
        'assets/img',
        'UserImages',
        'photos'
    ];

    let idx = parseInt(e.target.dataset.fallbackIdx || "0");
    const currentSrc = e.target.src;

    // Extract the "pure path" by identifying where the first known prefix ends
    // or by taking everything after the domain
    let relativePath = "";
    const knownPrefixes = ['uploads', 'storage', 'public', 'images', 'api', 'assets', 'img', 'UserImages'];

    let foundPrefix = false;
    for (const p of knownPrefixes) {
        const searchStr = `/${p}/`;
        const pIdx = currentSrc.indexOf(searchStr);
        if (pIdx !== -1) {
            relativePath = currentSrc.substring(pIdx + searchStr.length);
            foundPrefix = true;
            break;
        }
    }

    if (!foundPrefix) {
        // Fallback to just the filename if no prefix identified
        const urlParts = currentSrc.split('/');
        relativePath = urlParts[urlParts.length - 1].split('?')[0];
    }

    // Skip prefixes that would result in the same URL
    while (idx < prefixes.length && currentSrc.includes(`/${prefixes[idx]}/${relativePath}`)) {
        idx++;
    }

    if (idx < prefixes.length) {
        const nextPrefix = prefixes[idx];
        e.target.dataset.fallbackIdx = (idx + 1).toString();
        const nextSrc = `/${nextPrefix}${nextPrefix ? '/' : ''}${relativePath}`;
        console.log(`Image fallback [${idx}]: ${nextPrefix} -> ${nextSrc}`);
        e.target.src = nextSrc;
    } else if (idx === prefixes.length) {
        // Try filename at root
        e.target.dataset.fallbackIdx = (idx + 1).toString();
        e.target.src = `/${relativePath}`;
        console.log(`Image fallback [Root]: /${relativePath}`);
    } else if (idx === prefixes.length + 1) {
        // External Fallbacks to backend
        e.target.dataset.fallbackIdx = (idx + 1).toString();
        const fullBackendUrl = `https://api.petrajuniors.com/storage/${relativePath}`;
        console.log(`Image fallback [External Storage]: ${fullBackendUrl}`);
        e.target.src = fullBackendUrl;
    } else if (idx === prefixes.length + 2) {
        e.target.dataset.fallbackIdx = (idx + 1).toString();
        const fullBackendUrl = `https://api.petrajuniors.com/uploads/${relativePath}`;
        console.log(`Image fallback [External Uploads]: ${fullBackendUrl}`);
        e.target.src = fullBackendUrl;
    } else if (idx === prefixes.length + 3) {
        e.target.dataset.fallbackIdx = (idx + 1).toString();
        const fullBackendUrl = `https://api.petrajuniors.com/public/${relativePath}`;
        console.log(`Image fallback [External Public]: ${fullBackendUrl}`);
        e.target.src = fullBackendUrl;
    } else if (idx === prefixes.length + 4) {
        e.target.dataset.fallbackIdx = (idx + 1).toString();
        const fullBackendUrl = `https://api.petrajuniors.com/${relativePath}`;
        console.log(`Image fallback [External Root]: ${fullBackendUrl}`);
        e.target.src = fullBackendUrl;
    } else {
        // Ultimate fallback: Placeholder
        e.target.onerror = null;
        console.warn("All image fallback paths failed for:", relativePath);

        // Final attempt for common avatar if it was likely a profile pic
        if (relativePath.toLowerCase().includes('profile') || relativePath.toLowerCase().includes('user') || relativePath.toLowerCase().includes('avatar')) {
            e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        } else {
            e.target.src = "https://cdn-icons-png.flaticon.com/512/8847/8847419.png";
        }
    }
};
