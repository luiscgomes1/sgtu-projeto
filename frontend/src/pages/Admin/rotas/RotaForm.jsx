import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";

import { Plus } from "lucide-react";

export default function RotaForm({ form, isProcessing, onSubmit }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Nova Rota
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
            <FormField control={form.control} name="nome" render={({ field }) => (
              <FormItem className="flex-1 max-w-sm">
                <FormControl>
                  <Input {...field} placeholder="Ex: Rota Centro - UFTM" disabled={isProcessing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={isProcessing}>
              <Plus className="mr-2 h-4 w-4" />
              {isProcessing ? "Cadastrando..." : "Cadastrar Rota"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
