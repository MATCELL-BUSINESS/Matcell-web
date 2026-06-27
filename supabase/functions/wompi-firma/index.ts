// supabase/functions/wompi-firma/index.ts
//
// Genera la firma de integridad que exige Wompi antes de abrir el Widget.
// Fórmula oficial de Wompi:
//   SHA256( referencia + montoEnCentavos + moneda + secretoDeIntegridad )
//
// El frontend llama a esta función con { referencia, montoEnCentavos } y
// recibe { firma } para pasársela al WidgetCheckout. El secreto de
// integridad NUNCA sale de aquí.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WOMPI_INTEGRITY_SECRET = Deno.env.get("WOMPI_INTEGRITY_SECRET")!;
const MONEDA = "COP";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // en producción, restringe esto a tu dominio
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { referencia, montoEnCentavos } = await req.json();

    if (!referencia || !montoEnCentavos) {
      return new Response(
        JSON.stringify({ error: "Faltan 'referencia' o 'montoEnCentavos'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validación extra: confirmamos que el pedido exista y que el monto
    // coincida con lo que tenemos guardado, para evitar que alguien
    // manipule el monto desde el frontend antes de pedir la firma.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: pedido, error } = await supabase
      .from("pedidos")
      .select("total, estado_pago")
      .eq("numero_pedido", referencia)
      .single();

    if (error || !pedido) {
      return new Response(
        JSON.stringify({ error: "Pedido no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const totalEsperadoEnCentavos = Math.round(Number(pedido.total) * 100);
    if (totalEsperadoEnCentavos !== Number(montoEnCentavos)) {
      return new Response(
        JSON.stringify({ error: "El monto no coincide con el pedido registrado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cadena = `${referencia}${montoEnCentavos}${MONEDA}${WOMPI_INTEGRITY_SECRET}`;
    const firma = await sha256Hex(cadena);

    return new Response(
      JSON.stringify({ firma, moneda: MONEDA }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error generando firma Wompi:", err);
    return new Response(
      JSON.stringify({ error: "Error interno generando la firma" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
