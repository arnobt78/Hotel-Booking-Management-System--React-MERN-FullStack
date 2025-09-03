import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { useState, useRef, useEffect, useCallback } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface ImagePreview {
  id: string;
  file?: File;
  url: string;
  isExisting: boolean;
}

const ImagesSection = () => {
  const {
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useFormContext<HotelFormData>();

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const existingImageUrls = watch("imageUrls");

  // Initialize with existing images
  useEffect(() => {
    if (existingImageUrls && existingImageUrls.length > 0) {
      const existingPreviews: ImagePreview[] = existingImageUrls.map(
        (url, index) => ({
          id: `existing-${index}`,
          url,
          isExisting: true,
        })
      );
      setImagePreviews(existingPreviews);
    }
  }, [existingImageUrls]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPreviews: ImagePreview[] = Array.from(files).map(
      (file, index) => ({
        id: `new-${Date.now()}-${index}`,
        file,
        url: URL.createObjectURL(file),
        isExisting: false,
      })
    );

    const updatedPreviews = [...imagePreviews, ...newPreviews];

    // Update form values
    const newFiles = Array.from(files);
    const currentFiles = Array.from(watch("imageFiles") || []);
    const allFiles = [...currentFiles, ...newFiles];

    // Create a new FileList-like object
    const dataTransfer = new DataTransfer();
    allFiles.forEach((file) => dataTransfer.items.add(file));

    setValue("imageFiles", dataTransfer.files);
    setImagePreviews(updatedPreviews);
  };

  const handleDeleteImage = (imageId: string) => {
    const imageToDelete = imagePreviews.find((img) => img.id === imageId);
    if (!imageToDelete) return;

    const updatedPreviews = imagePreviews.filter((img) => img.id !== imageId);
    setImagePreviews(updatedPreviews);

    if (imageToDelete.isExisting) {
      // Remove from existing imageUrls
      const updatedUrls = existingImageUrls.filter(
        (url) => url !== imageToDelete.url
      );
      setValue("imageUrls", updatedUrls);
    } else {
      // Remove from new imageFiles
      const currentFiles = Array.from(watch("imageFiles") || []);
      const updatedFiles = currentFiles.filter((file) => {
        if (imageToDelete.file) {
          return file !== imageToDelete.file;
        }
        return true;
      });

      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => dataTransfer.items.add(file));
      setValue(
        "imageFiles",
        updatedFiles.length > 0 ? dataTransfer.files : undefined
      );
    }

    // Clean up object URL
    if (!imageToDelete.isExisting) {
      URL.revokeObjectURL(imageToDelete.url);
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const totalImages = imagePreviews.length;

  // Custom validation
  const validateImages = useCallback(() => {
    if (totalImages === 0) {
      return "At least one image should be added";
    }
    if (totalImages > 6) {
      return "Total number of images cannot be more than 6";
    }
    return true;
  }, [totalImages]);

  // Set validation error if needed
  useEffect(() => {
    const validationResult = validateImages();
    if (validationResult !== true) {
      setError("imageFiles", { message: validationResult });
    } else {
      clearErrors("imageFiles");
    }
  }, [totalImages, setError, clearErrors, validateImages]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Images</h2>
      <div className="border rounded-lg p-6 flex flex-col gap-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Upload Hotel Images
              </h3>
              <p className="text-gray-500 mb-4">
                Select multiple images to upload. You can upload up to 6 images
                total.
              </p>
              <Button
                onClick={handleUploadClick}
                variant="outline"
                className="bg-white hover:bg-gray-50"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose Images
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Selected Images ({totalImages}/6)
              </h3>
              {totalImages > 6 && (
                <span className="text-red-500 text-sm font-medium">
                  Maximum 6 images allowed
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagePreviews.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-gray-50 rounded-lg overflow-hidden border"
                >
                  <img
                    src={image.url}
                    alt="Hotel preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteImage(image.id);
                      }}
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                  <div className="p-2">
                    <Badge
                      variant={image.isExisting ? "outline" : "default"}
                      className="text-xs"
                    >
                      {image.isExisting ? "Existing" : "New Upload"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.imageFiles && (
          <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
            {errors.imageFiles.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesSection;
