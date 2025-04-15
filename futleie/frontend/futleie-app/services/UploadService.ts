export async function uploadImageToCloudinary(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    console.log("📤 Starter opplasting til Cloudinary...");
    console.log("🔍 Cloudinary Cloud Name:", cloudName);
    console.log("🔍 Upload Preset:", uploadPreset);
    console.log("📂 Filnavn:", file.name);

    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary cloud name eller upload preset mangler i miljøvariabler.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("📜 Cloudinary response:", data);

        if (!response.ok) {
            throw new Error(`Feil ved opplasting: ${data.error.message}`);
        }

        console.log("✅ Cloudinary URL mottatt:", data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error("❌ Cloudinary-opplasting feilet:", error);
        throw error;
    }
}
