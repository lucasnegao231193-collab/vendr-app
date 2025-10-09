/**
 * Tab: Equipe & Permissões
 * Lista de usuários, edição de roles, convites
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trash2, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export function EquipeTab() {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('user_id', user.id)
      .single();

    if (!perfil) return;

    const { data } = await supabase
      .from('vendedores')
      .select('*')
      .eq('empresa_id', perfil.empresa_id);

    setVendedores(data || []);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipe
            </CardTitle>
            <CardDescription>
              Gerencie vendedores e permissões
            </CardDescription>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Convidar Membro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vendedores.map((vendedor) => (
            <div key={vendedor.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  {vendedor.avatar_url && <AvatarImage src={vendedor.avatar_url} />}
                  <AvatarFallback>
                    {vendedor.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{vendedor.nome}</p>
                  <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Vendedor</Badge>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {vendedores.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum membro na equipe ainda
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
