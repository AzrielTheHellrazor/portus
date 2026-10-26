# Portus Development & Institutional Design Directives

## 1. Öncelik Sırası (Hierarchy of Authority)
Herhangi bir UI bileşeni, sayfa düzeni veya stil geliştirilirken öncelik sırası şöyledir:
1. **Portus İçerik ve Veri Kuralları:** Tek bir kaynak olan `src/config/demo.ts` ve kurumsal hazine direktifleri mutlaktır.
2. **Jobright Tasarım Sistemi:** `@docs/DESIGN.md` (Jobright) yapı, renk, spacing, radius ve buton geometrisi için temel kaynaktır.
3. **Awwwards / Jüri Standartları:** Tipografi dengesi, 60fps akıcı geçişler, temiz anlamsal HTML, SEO ve erişilebilirlik.
4. **Base UI Erişilebilir Primitives:** Switch, Dialog, Tabs, Meter, Tooltip bileşenleri.

---

## 2. Kesin Stil ve Token Kuralları
- **Bileşenlerde Ham Değer Yasağı:** Bileşenlerde ham hex (`#...`), `rgba(...)` veya Tailwind arbitrary renk değeri (`bg-[#...]`, `text-[rgba(...)]`) kullanmak **KESİNLİKLE YASAKTIR**. Yalnızca `globals.css` içinde tanımlanmış semantik token sınıfları (`bg-canvas`, `bg-surface`, `bg-surface-soft`, `text-text`, `text-text-2`, `bg-action`, `border-hairline`, vb.) kullanılabilir.
- **Konsol / Panel Token'ları:** Terminal ve Wire Inspector açık sayfa içinde koyu "inset" paneller olarak inşa edilir. Bu panellerde `--console-bg`, `--console-text`, `--console-hairline` token'ları kullanılır.
- **Tipografi & Tabular-Nums:** Tüm parasal değerler (`EURC`, `USDC`), döviz kurları, cüzdan/kontrat adresleri, işlem hash'leri, sayaçlar ve blok numaraları istisnasız `font-mono tabular-nums` ile yazılır.
- **Yasaklar:**
  - Gradient blob ve glow efekti
  - Emoji ikonlar
  - Stok illüstrasyonlar
  - "Powered by" bandı
  - Her bölümü ortalanmış başlık + alt başlık + 3 kart kalıbıyla dizmek
  - Pazarlama sıfatları ("revolutionary", "seamless", "next-gen")
  - Kullanıcıya görünen metinlerde iç referanslar ("Swiss Private Bank", "specimen", "phase", "lab")

---

## 3. Metin Kuralları
- Her bölüm başlığı en fazla **6 kelime**.
- Her açıklama en fazla **1 kısa cümle**.
- Teknik detaylar (P-256, Soroban, CAP-0085) ana metne yazılmaz; küçük etiketler, tooltip veya ikinci satırda `--text-2` renginde verilir.
- Dil kesinlikle İngilizce.

---

## 4. Veri Tutarlılığı (`src/config/demo.ts`)
Tüm bileşenler verileri `src/config/demo.ts` dosyasından okur:
- Rezerv: 50,000.00 EURC (EUR/USD 1.0862, ≈ $54,310.00 USDC)
- DEPT-OPS: Günlük limit $500.00 USDC, izinli satıcı YALNIZCA AWS
- AGENT-FX: Günlük limit $10.00 USDC, x402
- Stellar tx hash'leri: 64 karakterlik küçük harf hex, "0x" ön eksiz.
- Kasa kontrat adresi dinamik olarak `.env` veya `manifest.json`'dan okunur (XLM SAC kullanılmaz).

---

## 5. Next.js & Runtime Policy
Always prefer `bun` (`bun run`, `bun test`, `bunx`) over `npm` or `node`.
