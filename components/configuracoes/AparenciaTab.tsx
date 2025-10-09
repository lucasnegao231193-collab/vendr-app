/**
 * Tab: Aparência (Branding)
 * Logo, favicon, cor primária
 */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Palette, Save } from "lucide-react";

export function AparenciaTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Aparência
        </CardTitle>
        <CardDescription>
          Personalize a identidade visual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cor-primaria">Cor Primária</Label>
          <div className="flex gap-2">
            <Input
              id="cor-primaria"
              type="color"
              defaultValue="#0057FF"
              className="w-20 h-10"
            />
            <Input
              value="#0057FF"
              readOnly
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Esta cor será aplicada em toda a interface
          </p>
        </div>

        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-8 rounded-lg" style={{ backgroundColor: '#0057FF' }}>
            <p className="text-white font-semibold text-center">
              Exemplo de aplicação da cor primária
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
