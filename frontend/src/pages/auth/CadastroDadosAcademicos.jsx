import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

export default function CadastroDadosAcademicos({ control, faculdades, cursos, form, handleFaculdadeChange }) {
  return (
    <div>
      <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-foreground">Dados Acadêmicos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={control} name="faculdade_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Faculdade:</FormLabel>
            <FormControl>
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e.target.value)
                  handleFaculdadeChange(e.target.value)
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-foreground"
              >
                <option value="">Selecione</option>
                {faculdades.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="curso_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Curso:</FormLabel>
            <FormControl>
              <select
                {...field}
                disabled={!form.watch("faculdade_id")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-foreground"
              >
                <option value="">Selecione</option>
                {cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </div>
  )
}
