// For client-side usage
const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;

export const uploadToImageKit = async (file: File): Promise<string> => {
  try {
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const base64Data = await base64Promise;

    // Use ImageKit's upload API directly with fetch
    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
    formData.append("fileName", `${Date.now()}-${file.name}`);
    formData.append("folder", "/date-options");
    formData.append("useUniqueFileName", "true");

    const response = await fetch(
      `https://upload.imagekit.io/api/v1/files/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  } catch (error: any) {
    console.error("ImageKit upload error:", error);
    throw new Error(error.message || "Failed to upload image to ImageKit");
  }
};