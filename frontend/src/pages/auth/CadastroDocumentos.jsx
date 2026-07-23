import { Upload } from "lucide-react"

const DOCS = [
  { name: "comprovante_matricula_url", label: "Comprovante de Matrícula:", accept: "image/*,.pdf" },
  { name: "comprovante_residencia_url", label: "Comprovante de Residência:", accept: "image/*,.pdf" },
  { name: "foto_url", label: "Foto 3x4:", accept: "image/*" },
]

export default function CadastroDocumentos({ files, handleFileChange }) {
  return (
    <div>
      <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-foreground">Documentos Obrigatórios</h3>
      <div className="space-y-4">
        {DOCS.map(({ name, label, accept }) => (
          <div key={name} className="space-y-2">
            <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
            <label
              htmlFor={name}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 rounded-md px-4 py-3 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Upload size={18} />
              <span className="text-sm font-medium">
                {files[name] ? files[name].name : "Clique para selecionar"}
              </span>
            </label>
            <input id={name} type="file" name={name} accept={accept} onChange={handleFileChange} required className="hidden" />
          </div>
        ))}
      </div>
    </div>
  )
}
