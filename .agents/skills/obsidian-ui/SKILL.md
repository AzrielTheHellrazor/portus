---
name: obsidian-ui
description: Bu projede kullanılmaz.
---

# Obsidian UI Specification

Bu skill, yalnızca koyu tema yüzey katmanları (elevation), hairline kenarlıklar ve WCAG AAA kontrast disiplini sağlamak için kullanılır. **Kesinlikle marka renk paletini belirlemez ve ezmez.** Renkler daima kök `AGENTS.md` içerisindeki Portus token'larından (Zümrüt `#0B3B2C` / `#10B981` ve Pirinç `#D4A24C` / `#785316`) alınır.

## Yüzey Katmanları (Surface Hierarchy)
- **Canvas / Kök Zemin (`--surface-canvas`):** `#0C0F14` (Derin obsidyen siyah)
- **Kart / Panel Zemini (`--surface-raised`):** `#12161F` (Hafif yükseltilmiş mat obsidyen)
- **Overlay / Modal Zemini (`--surface-overlay`):** `#181E29` (Kritik etkileşim yüzeyi)
- **Girdi / Kontrol Zemini (`--surface-input`):** `rgba(255, 255, 255, 0.04)` ile `rgba(255, 255, 255, 0.07)` arası

## Kenarlıklar (Hairlines)
- Asla 1px'ten kalın sert beyaz çizgi kullanılmaz.
- Standart hairline: `border: 1px solid rgba(255, 255, 255, 0.08)`
- Vurgulu/Aktif hairline: `border: 1px solid rgba(255, 255, 255, 0.16)`
- Çift Bezel (Double Bezel): Dış çerçeve `rgba(255, 255, 255, 0.06)`, iç çerçeve `rgba(0, 0, 0, 0.4)`

## Metin Kontrastı
- Koyu zemin üstünde birincil metin: `#EDEDF3` (14.2:1 kontrast)
- Koyu zemin üstünde ikincil / meta metin: `rgba(255, 255, 255, 0.75)` (9.8:1 kontrast)
- Asla `text-white/40` gibi 4.5:1 altına düşen silik metin kullanılmaz.
