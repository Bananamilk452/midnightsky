"use client";

import { ImageIcon } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

interface ImageButtonProps {
  setImage: (file: File) => void;
}

export function ImageButton({ setImage }: ImageButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const resizedFile = await resizeImage(file);
      setImage(resizedFile);
    }
  }

  function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    inputRef.current?.click();
  }

  const maxSize = 1920;
  const resizeImage = (file: File) =>
    new Promise<File>((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        // 한 쪽 크기가 maxSize보다 크면 리사이즈
        if (img.width >= maxSize || img.height >= maxSize) {
          // 가로가 세로보다 길면
          if (img.width > img.height) {
            canvas.width = maxSize;
            canvas.height = maxSize / aspectRatio;
          }
          // 세로가 가로보다 길면
          else {
            canvas.height = maxSize;
            canvas.width = maxSize * aspectRatio;
          }
        }
        // 아님 그냥 사용
        else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: "image/webp",
              });
              resolve(resizedFile);
            }
          },
          "image/webp",
          0.8,
        );
      };
    });

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <Button
        size="sm"
        className="bg-violet-400 hover:cursor-pointer hover:bg-violet-400/90"
        onClick={onButtonClick}
      >
        <ImageIcon />
        이미지 추가
      </Button>
    </div>
  );
}
