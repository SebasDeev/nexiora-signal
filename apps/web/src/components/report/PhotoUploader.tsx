import { ImagePlus, RotateCcw, UploadCloud, X } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

import './PhotoUploader.css';

interface PhotoUploaderProps {
  image: File | null;
  preview: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function PhotoUploader({ image, preview, onChange, disabled = false }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function validateAndSetFile(file: File | null) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      setError('Usa una imagen JPG, PNG o WEBP de máximo 5 MB.');
      return;
    }

    setError(null);
    onChange(file);
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    validateAndSetFile(event.target.files?.[0] ?? null);
    event.target.value = '';
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) validateAndSetFile(event.dataTransfer.files?.[0] ?? null);
  }

  function removeImage() {
    setError(null);
    onChange(null);
    inputRef.current?.focus();
  }

  const uploaderClassName = ['photo-upload-area', preview ? 'has-preview' : '', isDragging ? 'is-dragging' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className="photo-uploader" aria-labelledby="photo-uploader-title">
      <div className="photo-uploader-heading">
        <div>
          <span id="photo-uploader-title">Fotografía del incidente</span>
          <small>Opcional, pero ayuda a validar el reporte.</small>
        </div>
        <span className="photo-uploader-limit">Máx. 5 MB</span>
      </div>

      <button
        type="button"
        className={uploaderClassName}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
        aria-describedby="photo-uploader-instructions"
      >
        {preview ? (
          <>
            <img src={preview} alt="Vista previa de la fotografía seleccionada" className="photo-upload-preview" />
            <span className="photo-upload-preview-overlay"><RotateCcw size={17} aria-hidden="true" />Cambiar fotografía</span>
          </>
        ) : (
          <span className="photo-upload-empty">
            <span className="photo-upload-icon" aria-hidden="true">{isDragging ? <UploadCloud size={27} /> : <ImagePlus size={27} />}</span>
            <strong>{isDragging ? 'Suelta la fotografía aquí' : 'Añade una fotografía'}</strong>
            <span id="photo-uploader-instructions">Arrastra un archivo o selecciónalo desde tu dispositivo</span>
            <small>JPG, PNG o WEBP</small>
          </span>
        )}
      </button>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleSelect} disabled={disabled} />

      {image && (
        <div className="photo-file-details">
          <span className="photo-file-thumbnail" aria-hidden="true"><ImagePlus size={15} /></span>
          <span className="photo-file-name" title={image.name}>{image.name}</span>
          <span className="photo-file-size">{formatFileSize(image.size)}</span>
          <button type="button" onClick={removeImage} disabled={disabled} aria-label="Quitar fotografía"><X size={16} aria-hidden="true" /></button>
        </div>
      )}
      {error && <p className="photo-uploader-error" role="alert">{error}</p>}
    </section>
  );
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`;
}
