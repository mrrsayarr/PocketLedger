
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useEffect } from "react";

export default function AboutEsPage() {
    useEffect(() => {
    if (typeof window !== "undefined") { 
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode === 'true') { 
          document.documentElement.classList.add('dark');
        } else { 
          document.documentElement.classList.remove('dark');
        }
    }
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm text-foreground">
      <header className="flex flex-col text-center sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.info className="h-8 w-8 sm:h-10 sm:w-10 md:mr-2" />
          <span className="hidden md:inline">Acerca de PocketLedger Pro</span>
        </h1>
        <div className="flex gap-2">
          <Link href="/settings" passHref>
            <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
              <Icons.settings className="mr-2 h-5 w-5" />
              Configuración
            </Button>
          </Link>
          <Link href="/" passHref>
            <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
              <Icons.arrowLeft className="mr-2 h-5 w-5" />
              Volver al Panel
            </Button>
          </Link>
        </div>
      </header>

      <div className="space-y-6 sm:space-y-8">
        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Propósito del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              PocketLedger Pro es una aplicación de gestión de finanzas personales diseñada para ayudarte a rastrear tus ingresos y gastos sin esfuerzo.
              El objetivo principal es proporcionar a los usuarios una visión clara de su salud financiera, permitiéndoles tomar decisiones informadas sobre sus hábitos de gasto y ahorro.
            </p>
            <p>
              Con PocketLedger Pro, puedes categorizar transacciones, visualizar tus patrones de gasto a través de gráficos y mantener notas relacionadas con tus actividades financieras.
              La aplicación tiene como objetivo ser intuitiva, fácil de usar y accesible, haciendo que el seguimiento financiero sea una tarea simple y manejable para todos.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Almacenamiento y Seguridad de Datos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              <strong>¿Dónde se almacenan mis datos?</strong>
              <br />
              Todos tus datos financieros, incluidas las transacciones y notas, se almacenan localmente en tu propio dispositivo dentro del almacenamiento de tu navegador web (específicamente, utilizando IndexedDB para transacciones y localStorage para notas y preferencias de tema).
            </p>
            <p>
              <strong>¿Cómo se almacenan mis datos?</strong>
              <br />
              Los datos se almacenan en un formato estructurado. Las transacciones se almacenan en una base de datos IndexedDB, que es una solución robusta de almacenamiento del lado del cliente. Las notas financieras y la configuración de la aplicación (como tu preferencia de tema) se almacenan en localStorage.
              Esto significa que tus datos no salen de tu computadora o dispositivo y no se envían a ningún servidor externo.
            </p>
            <p>
              <strong>¿Quién puede acceder a mis datos?</strong>
              <br />
              Solo tú puedes acceder a tus datos. Dado que los datos se almacenan localmente en tu navegador, están aislados y no pueden ser accedidos por otros sitios web o usuarios en otros dispositivos. PocketLedger Pro no tiene ningún componente del lado del servidor que almacene o procese tu información financiera personal.
            </p>
             <p>
              <strong><u>Persistencia de Datos:</u></strong>
              <br />
              Tus datos persistirán en tu navegador siempre y cuando no borres los datos del sitio de tu navegador para PocketLedger Pro. Si utilizas un navegador diferente o un dispositivo diferente, los datos no se sincronizarán, ya que son completamente locales a la instancia específica del navegador que utilizaste para ingresarlos.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Cómo Funciona el Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              PocketLedger Pro está construido utilizando tecnologías web modernas, principalmente Next.js (un framework de React) y TypeScript.
              Se utilizan componentes de ShadCN UI y Tailwind CSS para el estilo para crear una interfaz receptiva y visualmente atractiva.
            </p>
            <p>
              <strong>Aplicación Frontend:</strong> Toda la aplicación se ejecuta en tu navegador web. Cuando agregas una transacción o una nota, es procesada por JavaScript que se ejecuta en el lado del cliente y luego se guarda en el almacenamiento local de tu navegador.
            </p>
            <p>
              <strong>Base de Datos Local:</strong> Utilizamos IndexedDB, una API de bajo nivel para el almacenamiento del lado del cliente de cantidades significativas de datos estructurados, incluidos archivos/blobs. Esto permite una consulta y gestión eficientes de tu historial de transacciones directamente dentro de tu navegador.
            </p>
            <p>
              <strong>Gestión de Estado:</strong> La gestión de estado de React (useState, useEffect, useCallback) se utiliza para manejar el flujo de datos de la aplicación y las actualizaciones de la interfaz de usuario.
            </p>
            <p>
              <strong>Sin Procesamiento del Lado del Servidor para Datos Personales:</strong> Es importante reiterar que tus datos financieros personales no se transmiten, almacenan ni procesan en ningún servidor remoto. Todas las operaciones se manejan localmente.
            </p>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-foreground">
            © {new Date().getFullYear()} PocketLedger Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

