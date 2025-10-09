/**
 * AvatarUploader - Componente reutilizável para upload de avatares
 * Suporta preview, crop circular, validação e upload para Supabase Storage
 */
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  entityType: 'empresa' | 'vendedor' | 'autonomo' | 'profile';
  entityId: string;
  fallbackInitials?: string;
  onUploadComplete?: (url: string, thumbUrl: string) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

export function AvatarUploader({
  currentAvatarUrl,
  entityType,
  entityId,
  fallbackInitials = 'U',
  onUploadComplete,
  onUploadError,
  className,
  size = 'md',
}: AvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipo de arquivo não permitido. Use: ${ALLOWED_TYPES.join(', ')}`;
    }

    if (file.size > MAX_SIZE) {
      return `Arquivo muito grande. Máximo: ${MAX_SIZE / 1024 / 1024}MB`;
    }

    return null;
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Erro na validação",
        description: error,
        variant: "destructive",
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);

      const response = await fetch('/api/uploads/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload');
      }

      const data = await response.json();
      
      setAvatarUrl(data.url);
      setPreview(null);

      toast({
        title: "Upload concluído!",
        description: "Sua foto foi atualizada com sucesso.",
      });

      if (onUploadComplete) {
        onUploadComplete(data.url, data.thumbUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });

      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }

      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setAvatarUrl(undefined);
    setPreview(null);
    toast({
      title: "Foto removida",
      description: "Sua foto de perfil foi removida.",
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = preview || avatarUrl;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative group">
        <Avatar className={cn(sizeClasses[size], "border-2 border-border")}>
          {displayUrl && <AvatarImage src={displayUrl} alt="Avatar" />}
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>

        {/* Upload Button Overlay */}
        <button
          onClick={handleClick}
          disabled={isUploading}
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-black/60 opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200",
            "flex items-center justify-center",
            "cursor-pointer disabled:cursor-not-allowed",
            isUploading && "opacity-100"
          )}
          aria-label="Fazer upload de foto"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>

        {/* Remove Button */}
        {avatarUrl && !isUploading && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            aria-label="Remover foto"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Upload Button (mobile-friendly) */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isUploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Enviando...' : 'Escolher Foto'}
        </Button>

        {avatarUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            Remover
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Selecionar arquivo"
      />

      {/* Upload Info */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        JPG, PNG ou WebP. Máximo 2MB.
      </p>
    </div>
  );
}
