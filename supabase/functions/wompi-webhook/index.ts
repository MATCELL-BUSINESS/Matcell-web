// supabase/functions/wompi-webhook/index.ts
//
// Recibe el evento que Wompi envía cuando una transacción cambia de estado
// (aprobada, declinada, etc). Valida el checksum del evento usando el
// secreto de eventos, y si es válido, actualiza 'pedidos' con el rol de
// servicio (el rol público no tiene permiso de UPDATE).
//
// Wompi firma el evento así:
//   SHA256( valoresDeLasPropiedadesIndicadas + timestamp + secretoDeEventos )
// Las propiedades a concatenar vienen indicadas en event.signature.properties
// (típicamente "transaction.id", "transaction.status", "transaction.amount_in_cents").

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WOMPI_EVENTS_SECRET = Deno.env.get("WOMPI_EVENTS_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function obtenerValorAnidado(obj: any, ruta: string) {
  return ruta.split(".").reduce((acc, key) => acc?.[key], obj);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const evento = await req.json();

    const propiedades: string[] = evento?.signature?.properties ?? [];
    const checksumRecibido: string = evento?.signature?.checksum ?? "";
    const timestamp = evento?.timestamp;

    if (!propiedades.length || !checksumRecibido || !timestamp) {
      return new Response(
        JSON.stringify({ error: "Evento sin firma válida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const valoresConcatenados = propiedades
      .map((ruta) => obtenerValorAnidado(evento.data, ruta))
      .join("");

    const cadena = `${valoresConcatenados}${timestamp}${WOMPI_EVENTS_SECRET}`;
    const checksumCalculado = await sha256Hex(cadena);

    if (checksumCalculado !== checksumRecibido) {
      console.warn("Checksum de Wompi no coincide, evento ignorado");
      return new Response(
        JSON.stringify({ error: "Firma inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const transaccion = evento?.data?.transaction;
    if (!transaccion) {
      return new Response(
        JSON.stringify({ error: "Evento sin datos de transacción" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const referencia = transaccion.reference; // este es nuestro numero_pedido
    const estadoWompi = transaccion.status; // APPROVED, DECLINED, VOIDED, ERROR, PENDING

    // pedidos.estado_pago tiene un CHECK que solo admite estos 3 valores
    // ('pendiente' | 'aprobado' | 'rechazado') — VOIDED y ERROR se tratan
    // como rechazado porque, en cualquiera de los dos casos, el pago no
    // se completó.
    const mapaEstados: Record<string, string> = {
      APPROVED: "aprobado",
      DECLINED: "rechazado",
      VOIDED: "rechazado",
      ERROR: "rechazado",
      PENDING: "pendiente",
    };

    const nuevoEstadoPago = mapaEstados[estadoWompi] ?? "pendiente";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase
      .from("pedidos")
      .update({
        estado_pago: nuevoEstadoPago,
        wompi_transaction_id: transaccion.id,
      })
      .eq("numero_pedido", referencia);

    if (error) {
      console.error("Error actualizando pedido tras webhook Wompi:", error);
      return new Response(
        JSON.stringify({ error: "No se pudo actualizar el pedido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ recibido: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error procesando webhook Wompi:", err);
    return new Response(
      JSON.stringify({ error: "Error interno procesando el webhook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
