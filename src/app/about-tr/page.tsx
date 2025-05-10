
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useEffect } from "react";

export default function AboutTrPage() {
    useEffect(() => {
    // Tema senkronizasyonu
    const storedDarkMode = localStorage.getItem('darkMode');
    if (typeof window !== "undefined") { // Ensure this runs client-side
        if (storedDarkMode === 'false') { 
          document.documentElement.classList.remove('dark');
        } else { 
          // Default to dark if 'true' or null (not set)
          document.documentElement.classList.add('dark');
        }
    }
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm text-foreground">
      <header className="flex flex-col text-center sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.info className="mr-2 h-8 w-8 sm:h-10 sm:w-10" />
          PocketLedger Pro Hakkında
        </h1>
        <Link href="/" passHref>
          <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
            <Icons.arrowLeft className="mr-2 h-5 w-5" />
            Gösterge Paneline Geri Dön
          </Button>
        </Link>
      </header>

      <div className="space-y-6 sm:space-y-8">
        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Projenin Amacı</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              PocketLedger Pro, gelir ve giderlerinizi zahmetsizce takip etmenize yardımcı olmak için tasarlanmış kişisel bir finans yönetimi uygulamasıdır.
              Temel amaç, kullanıcılara mali durumlarına ilişkin net bir genel bakış sunarak harcama ve tasarruf alışkanlıkları hakkında bilinçli kararlar almalarını sağlamaktır.
            </p>
            <p>
              PocketLedger Pro ile işlemleri kategorize edebilir, harcama alışkanlıklarınızı grafikler aracılığıyla görselleştirebilir ve mali faaliyetlerinizle ilgili notlar tutabilirsiniz.
              Uygulama, herkes için mali takibi basit ve yönetilebilir bir görev haline getiren sezgisel, kullanıcı dostu ve erişilebilir olmayı amaçlamaktadır.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Veri Depolama ve Güvenlik</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              <strong>Verilerim nerede saklanıyor?</strong>
              <br />
              İşlemler ve notlar dahil tüm mali verileriniz, web tarayıcınızın depolama alanında (özellikle işlemler için IndexedDB ve notlar ile tema tercihleri için localStorage kullanarak) kendi cihazınızda yerel olarak saklanır.
            </p>
            <p>
              <strong>Verilerim nasıl saklanıyor?</strong>
              <br />
              Veriler yapılandırılmış bir formatta saklanır. İşlemler, sağlam bir istemci tarafı depolama çözümü olan bir IndexedDB veritabanında saklanır. Mali notlar ve uygulama ayarları (tema tercihiniz gibi) localStorage'da saklanır.
              Bu, verilerinizin bilgisayarınızdan veya cihazınızdan ayrılmadığı ve herhangi bir harici sunucuya gönderilmediği anlamına gelir.
            </p>
            <p>
              <strong>Verilerime kimler erişebilir?</strong>
              <br />
              Verilerinize yalnızca siz erişebilirsiniz. Veriler tarayıcınızda yerel olarak saklandığından, sanal alana alınır ve diğer web siteleri veya diğer cihazlardaki kullanıcılar tarafından erişilemez. PocketLedger Pro'nun kişisel mali bilgilerinizi saklayan veya işleyen herhangi bir sunucu tarafı bileşeni yoktur.
            </p>
             <p>
              <strong><u>Veri Kalıcılığı:</u></strong>
              <br />
              PocketLedger Pro için tarayıcınızın site verilerini temizlemediğiniz sürece verileriniz tarayıcınızda kalacaktır. Farklı bir tarayıcı veya farklı bir cihaz kullanırsanız, veriler girdiğiniz belirli tarayıcı örneğine tamamen yerel olduğu için senkronize edilmeyecektir.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Proje Nasıl Çalışıyor</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              PocketLedger Pro, başta Next.js (bir React çatısı) ve TypeScript olmak üzere modern web teknolojileri kullanılarak oluşturulmuştur.
              Duyarlı ve görsel olarak çekici bir arayüz oluşturmak için stil için ShadCN UI bileşenleri ve Tailwind CSS kullanılır.
            </p>
            <p>
              <strong>Ön Uç Uygulaması:</strong> Tüm uygulama web tarayıcınızda çalışır. Bir işlem veya not eklediğinizde, istemci tarafında çalışan JavaScript tarafından işlenir ve ardından tarayıcınızın yerel depolama alanına kaydedilir.
            </p>
            <p>
              <strong>Yerel Veritabanı:</strong> Dosyalar/bloblar dahil olmak üzere önemli miktarda yapılandırılmış verinin istemci tarafında depolanması için düşük seviyeli bir API olan IndexedDB'yi kullanıyoruz. Bu, işlem geçmişinizin doğrudan tarayıcınızda verimli bir şekilde sorgulanmasını ve yönetilmesini sağlar.
            </p>
            <p>
              <strong>Durum Yönetimi:</strong> React'in durum yönetimi (useState, useEffect, useCallback), uygulamanın veri akışını ve kullanıcı arayüzü güncellemelerini yönetmek için kullanılır.
            </p>
            <p>
              <strong>Kişisel Veriler İçin Sunucu Tarafı İşleme Yok:</strong> Kişisel mali verilerinizin herhangi bir uzak sunucuya iletilmediğini, üzerinde saklanmadığını veya işlenmediğini yinelemek önemlidir. Tüm işlemler yerel olarak gerçekleştirilir.
            </p>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-foreground">
            © {new Date().getFullYear()} PocketLedger Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
