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

type Props = {
  newImageFiles: File[];
  setNewImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

const ImagesSection = ({ newImageFiles, setNewImageFiles }: Props) => {
  const {
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useFormContext<HotelFormData>();

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingImageUrls = watch("imageUrls") || [];

  useEffect(() => {
    const existingPreviews: ImagePreview[] = existingImageUrls.map((url, index) => ({
      id: `existing-${index}-${url}`, 
      url,
      isExisting: true,
    }));

    const newPreviews: ImagePreview[] = newImageFiles.map((file, index) => ({
      id: `new-${index}-${file.name}-${file.lastModified}`,
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImagePreviews([...existingPreviews, ...newPreviews]);

    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [existingImageUrls, newImageFiles]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const picked = Array.from(files);

    setNewImageFiles((prev) => [...prev, ...picked]);
    event.target.value = "";
  };

  const handleDeleteImage = (imageId: string) => {
    const img = imagePreviews.find((x) => x.id === imageId);
    if (!img) return;

    if (img.isExisting) {
      const updatedUrls = existingImageUrls.filter((url) => url !== img.url);
      setValue("imageUrls", updatedUrls, { shouldDirty: true });
    } else {
      setNewImageFiles((prev) =>
        prev.filter((f) => !(img.file && f === img.file))
      );

      URL.revokeObjectURL(img.url);
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const totalImages = existingImageUrls.length + newImageFiles.length;

  const validateImages = useCallback(() => {
    if (totalImages === 0) return "At least one image should be added";
    if (totalImages > 6) return "Total number of images cannot be more than 6";
    return true;
  }, [totalImages]);

  useEffect(() => {
    const validationResult = validateImages();
    if (validationResult !== true) {
      setError("imageUrls", { message: validationResult as string });
    } else {
      clearErrors("imageUrls");
    }
  }, [totalImages, setError, clearErrors, validateImages]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Images</h2>
      <div className="border rounded-lg p-6 flex flex-col gap-6">
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
                Select multiple images to upload. You can upload up to 6 images total.
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

        {(errors.imageUrls as any)?.message && (
          <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
            {(errors.imageUrls as any).message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesSection;
