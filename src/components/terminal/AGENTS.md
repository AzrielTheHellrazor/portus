# Terminal & Execution Console Directives

Bu dizindeki ve terminal/telemetri bileşenlerindeki tüm arayüzler aşağıdaki kurallara göre inşa edilir:

## 1. Tipografi & Satır Yoğunluğu
- **Yazı Tipi:** Kesinlikle `font-mono` (`JetBrains Mono` / monospace) ve `tabular-nums`.
- **Satır Yoğunluğu (Density):** Kompakt ve yüksek yoğunluklu (high-density). Satır yüksekliği `leading-snug` veya `leading-tight`, font boyutu kod ve loglar için `text-xs` (`12px`) veya `text-[11px]`.
- **Hiyerarşi:** Zaman damgaları (`timestamp`), HTTP metodları, durum kodları ve işlem hash'leri tek satırda hizalanır.

## 2. Durum Renkleri (Status Codes & Semantic States)
- **HTTP 402 (Payment Required):** Sarı / Pirinç (`text-status-pending` veya `bg-status-pending/20 border border-status-pending/40 text-status-pending`).
- **HTTP 200 (OK / Settled):** Zümrüt (`text-status-ok` veya `bg-status-ok/20 border border-status-ok/40 text-status-ok`).
- **#9 MerchantNotWhitelisted (Revert / Breach Blocked):** Kırmızı (`text-status-error` veya `bg-status-error/20 border border-status-error/40 text-status-error`).
- **Nötr / Ağ Logları:** Soluk metin `text-text-2`, ikincil etiketler `text-text-3`.

## 3. Zemin ve Kenarlıklar
- Koyu obsidyen zemin (`bg-canvas` veya `bg-raised`).
- İnce hairline kenarlıklar (`border border-hairline`).
- Konsol başlıklarında ve terminal sekmelerinde Mercury hap (pill `rounded-pill`) rozetleri.
