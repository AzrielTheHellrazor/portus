# Terminal & Execution Console Directives

Bu dizindeki ve terminal/telemetri bileşenlerindeki tüm arayüzler aşağıdaki kurallara göre inşa edilir:

## 1. Tipografi & Satır Yoğunluğu
- **Yazı Tipi:** Kesinlikle `font-mono` (`JetBrains Mono` / monospace) ve `tabular-nums`.
- **Satır Yoğunluğu (Density):** Kompakt ve yüksek yoğunluklu (high-density). Satır yüksekliği `leading-snug` veya `leading-tight`, font boyutu kod ve loglar için `text-xs` (`12px`) veya `text-[11px]`.
- **Hiyerarşi:** Zaman damgaları (`timestamp`), HTTP metodları, durum kodları ve işlem hash'leri tek satırda hizalanır.

## 2. Durum Renkleri (Status Codes & Semantic States)
- **HTTP 402 (Payment Required):** Sarı / Pirinç (`text-[#D4A24C]` veya `bg-[#D4A24C]/20 border border-[#D4A24C]/40 text-[#D4A24C]`).
- **HTTP 200 (OK / Settled):** Zümrüt (`text-[#10B981]` veya `bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]`).
- **#9 MerchantNotWhitelisted (Revert / Breach Blocked):** Kırmızı (`text-[#EF4444]` veya `bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444]`).
- **Nötr / Ağ Logları:** Soluk beyaz `text-white/75`, ikincil etiketler `text-white/45`.

## 3. Zemin ve Kenarlıklar
- Koyu obsidyen zemin (`bg-[#0C0F14]` veya `bg-[#12161F]`).
- İnce hairline kenarlıklar (`border border-white/10`).
- Konsol başlıklarında ve terminal sekmelerinde Mercury hap (pill `rounded-full`) rozetleri.
