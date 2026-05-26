import AppInput from './AppInput';

function formatBytes(bytes) {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}

export default function CompanyForm({ company, onChange, onLogoUpload }) {
  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onLogoUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onLogoUpload(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="editor-section">
      <div className="section-header">
        <div>
          <h3>Company details</h3>
          <p className="section-subtitle">Update company name, email and logo for the slip preview.</p>
        </div>
      </div>

      <div className="editor-grid">
        <div className="logo-upload-panel" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <div className="logo-preview">
            {company.logo ? (
              <img src={company.logo} alt="Company logo preview" className="logo-preview-image" />
            ) : (
              <div className="logo-preview-empty">Drop logo or upload</div>
            )}
          </div>
          <div className="logo-upload-info">
            <p className="logo-upload-label">Logo perusahaan</p>
            <p className="logo-upload-caption">Drag & drop atau pilih file PNG/JPG. Ukuran maksimal 2MB.</p>
            <label className="app-button app-button-secondary app-button-sm" htmlFor="company-logo-upload">Upload logo</label>
            <input id="company-logo-upload" type="file" accept="image/*" hidden onChange={handleFileChange} />
            {company.logo?.startsWith('data:') && <p className="logo-size">Preview dari image upload.</p>}
          </div>
        </div>

        <div className="form-grid">
          <AppInput label="Nama PT" value={company.name} onChange={(e) => onChange('company', 'name', e.target.value)} placeholder="PT Global Digital Zone" />
          <AppInput label="Email perusahaan" type="email" value={company.email} onChange={(e) => onChange('company', 'email', e.target.value)} placeholder="email@domain.com" />
        </div>
      </div>
    </div>
  );
}
