/**
 * Calculadora de troco
 */
"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Delete } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrocoPage() {
  const [total, setTotal] = useState(0);
  const [recebido, setRecebido] = useState(0);
  const [modo, setModo] = useState<"total" | "recebido">("total");
  
  const router = useRouter();

  const handleNumero = (num: string) => {
    if (modo === "total") {
      setTotal(parseFloat(`${total}${num}`) / 100);
    } else {
      setRecebido(parseFloat(`${recebido}${num}`) / 100);
    }
  };

  const handleClear = () => {
    if (modo === "total") {
      setTotal(0);
    } else {
      setRecebido(0);
    }
  };

  const handleBackspace = () => {
    if (modo === "total") {
      setTotal(Math.floor(total * 10) / 100);
    } else {
      setRecebido(Math.floor(recebido * 10) / 100);
    }
  };

  const troco = recebido - total;
  const numeros = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00"];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Calculadora de Troco</h1>
        </div>

        {/* Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {modo === "total" ? "Valor da Compra" : "Valor Recebido"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-5xl font-bold text-center py-6 ${
                modo === "total" ? "text-primary" : "text-green-600"
              }`}
            >
              {formatCurrency(modo === "total" ? total : recebido)}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant={modo === "total" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setModo("total")}
              >
                Total
              </Button>
              <Button
                variant={modo === "recebido" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setModo("recebido")}
              >
                Recebido
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {recebido >= total && total > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-green-700 mb-2">Troco a devolver</p>
                <p className="text-6xl font-bold text-green-700">
                  {formatCurrency(troco)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teclado */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-3">
              {numeros.map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  className="h-16 text-2xl font-semibold"
                  onClick={() => handleNumero(num)}
                >
                  {num}
                </Button>
              ))}

              <Button
                variant="destructive"
                className="h-16 col-span-2"
                onClick={handleClear}
              >
                Limpar
              </Button>

              <Button
                variant="outline"
                className="h-16"
                onClick={handleBackspace}
              >
                <Delete className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
