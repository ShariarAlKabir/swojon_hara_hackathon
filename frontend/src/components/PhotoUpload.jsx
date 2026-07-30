import { useRef, useState } from "react";

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

export default function PhotoUpload({ id, label, value, onChange, required = false, helpText }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  function handleFile(event) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("The image must be smaller than 3 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.onerror = () => setError("The image could not be read. Try another file.");
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    onChange("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="photo-upload">
      <label className="form-label" htmlFor={id}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        ref={inputRef}
        id={id}
        className="photo-upload-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        required={required}
      />
      {helpText && <small className="form-help">{helpText}</small>}
      {error && <p className="photo-upload-error" role="alert">{error}</p>}
      {value && (
        <div className="photo-preview">
          <img src={value} alt="Selected proof preview" />
          <button className="photo-remove-button" type="button" onClick={removePhoto}>Remove photo</button>
        </div>
      )}
    </div>
  );
}
