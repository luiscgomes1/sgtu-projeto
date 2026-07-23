import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";

import { Plus } from "lucide-react";

export default function PontoForm({ form, isProcessing, onSubmit }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Novo Ponto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="nome" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do ponto</FormLabel>
                <FormControl><Input {...field} placeholder="Ex: Praça da Bandeira" disabled={isProcessing} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div>
              <p className="text-sm font-medium mb-2">Endereço</p>
              <div className="space-y-3">
                <FormField control={form.control} name="enderecoRua" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Rua</FormLabel>
                    <FormControl><Input {...field} placeholder="Ex: Av. Getúlio Guaritá" disabled={isProcessing} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="enderecoNumero" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Número</FormLabel>
                      <FormControl><Input {...field} placeholder="Ex: 100" disabled={isProcessing} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="enderecoBairro" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Bairro</FormLabel>
                      <FormControl><Input {...field} placeholder="Ex: Centro" disabled={isProcessing} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="enderecoCidade" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Cidade</FormLabel>
                    <FormControl><Input {...field} placeholder="Ex: Uberaba" disabled={isProcessing} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            <Button type="submit" disabled={isProcessing}>
              <Plus className="mr-2 h-4 w-4" />
              {isProcessing ? "Cadastrando..." : "Cadastrar Ponto"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
