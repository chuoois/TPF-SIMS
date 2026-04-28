/**
 * Cloudinary Service
 * Upload ảnh trực tiếp từ frontend (unsigned)
 * Created By: ThinhBui
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload 1 ảnh
 * @param {File} file
 * @returns {Promise<Object>}
 */
export const uploadImage = async (file) => {
    if (!file) throw new Error("File is required");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const res = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error("Cloudinary response error:", errBody);
            throw new Error(`Upload failed: ${res.status} - ${errBody}`);
        }

        const data = await res.json();

        return {
            url: data.secure_url,
            public_id: data.public_id,
            width: data.width,
            height: data.height,
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

/**
 * Upload nhiều ảnh
 * @param {File[]} files
 */
export const uploadMultipleImages = async (files) => {
    return Promise.all(files.map(uploadImage));
};