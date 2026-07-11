import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud, Camera, Sparkles } from "lucide-react";

interface Props {
  onImage: (file: File) => void;
  onSample: () => void;
}

export function ImageDropzone({ onImage, onSample }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImage(file);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={`dropzone ${dragging ? "dropzone-active" : ""}`.trim()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <span className="dropzone-icon">
        <UploadCloud size={30} strokeWidth={1.7} />
      </span>
      <h2 className="dropzone-title">Drop a chamber photo here</h2>
      <p className="dropzone-sub muted">
        Upload an image from a digital microscope or capture one from your camera.
      </p>

      <div className="dropzone-actions">
        <button className="btn btn-primary" onClick={() => fileInput.current?.click()}>
          <UploadCloud size={16} />
          Upload image
        </button>
        <button className="btn btn-ghost" onClick={() => cameraInput.current?.click()}>
          <Camera size={16} />
          Use camera
        </button>
        <button className="btn btn-ghost" onClick={onSample}>
          <Sparkles size={16} />
          Try a sample
        </button>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={onChange}
      />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onChange}
      />
    </div>
  );
}
