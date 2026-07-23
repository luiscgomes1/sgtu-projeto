import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { User, Mail, Lock, Eye, EyeOff, IdCard, Phone, Cake, MapPin, Hash, Building, Globe } from "lucide-react"

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

function formatCPF(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 1) return digits
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
}

// eslint-disable-next-line no-unused-vars
function inputIcon(Icon) {
  return <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
}

export default function CadastroDadosPessoais({ control, showPassword, setShowPassword }) {
  return (
    <div>
      <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-foreground">Dados Pessoais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={control} name="nome" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo:</FormLabel>
            <div className="relative">
              {inputIcon(User)}
              <FormControl>
                <Input {...field} className="pl-10" />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email:</FormLabel>
            <div className="relative">
              {inputIcon(Mail)}
              <FormControl>
                <Input {...field} type="email" inputMode="email" className="pl-10" />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="senha" render={({ field }) => (
          <FormItem>
            <FormLabel>Senha:</FormLabel>
            <div className="relative">
              {inputIcon(Lock)}
              <FormControl>
                <Input {...field} type={showPassword ? "text" : "password"} className="pl-10 pr-10" />
              </FormControl>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="cpf" render={({ field }) => (
          <FormItem>
            <FormLabel>CPF:</FormLabel>
            <div className="relative">
              {inputIcon(IdCard)}
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(formatCPF(e.target.value))}
                  inputMode="numeric"
                  className="pl-10"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="rg" render={({ field }) => (
          <FormItem>
            <FormLabel>RG:</FormLabel>
            <div className="relative">
              {inputIcon(IdCard)}
              <FormControl>
                <Input {...field} className="pl-10" />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="telefone" render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone:</FormLabel>
            <div className="relative">
              {inputIcon(Phone)}
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  inputMode="numeric"
                  className="pl-10"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="data_nascimento" render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Nascimento:</FormLabel>
            <div className="relative">
              {inputIcon(Cake)}
              <FormControl>
                <Input {...field} type="date" className="pl-10" />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="tipo_sanguineo" render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo Sanguíneo:</FormLabel>
            <FormControl>
              <select
                {...field}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-foreground"
              >
                <option value="">Selecione</option>
                {BLOOD_TYPES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-1">Endereço</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <FormField control={control} name="logradouro" render={({ field }) => (
                <FormItem>
                  <FormLabel>Logradouro:</FormLabel>
                  <div className="relative">
                    {inputIcon(MapPin)}
                    <FormControl>
                      <Input {...field} className="pl-10" placeholder="Rua, Avenida..." />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div>
              <FormField control={control} name="numero" render={({ field }) => (
                <FormItem>
                  <FormLabel>Número:</FormLabel>
                  <div className="relative">
                    {inputIcon(Hash)}
                    <FormControl>
                      <Input {...field} className="pl-10" placeholder="Nº" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div>
              <FormField control={control} name="bairro" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro:</FormLabel>
                  <div className="relative">
                    {inputIcon(Building)}
                    <FormControl>
                      <Input {...field} className="pl-10" placeholder="Bairro" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div>
              <FormField control={control} name="cidade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade:</FormLabel>
                  <div className="relative">
                    {inputIcon(Building)}
                    <FormControl>
                      <Input {...field} className="pl-10" placeholder="Cidade" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div>
              <FormField control={control} name="estado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado:</FormLabel>
                  <div className="relative">
                    {inputIcon(Globe)}
                    <FormControl>
                      <Input {...field} className="pl-10" placeholder="UF" maxLength={2} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
