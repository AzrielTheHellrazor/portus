---
name: base-ui
description: Erişilebilir, unstyled headless UI primitive'leri (Switch, Dialog, Tabs, Meter) ve durum yönetimi için rehber.
---

# Base UI Primitives Specification

Bu skill, React/Tailwind projelerinde tamamen erişilebilir, unstyled UI primitive'lerinin (Switch, Dialog/Modal, Tabs, Meter/Progress) doğru ARIA nitelikleri, klavye yönetimi ve durum geçişleriyle inşa edilmesini sağlar.

## 1. Switch Primitive (İki Durumlu Anahtar)
- **Rol:** `role="switch"`
- **ARIA:** `aria-checked={boolean}`, `aria-label` veya `aria-labelledby` zorunlu.
- **Klavye:** `Space` ve `Enter` ile durum değişir.
- **Geometri:** Tam hap (pill `rounded-full`), iç başparmak (thumb) `transition-transform duration-200 ease-out`.

## 2. Dialog Primitive (Modal / Drawer)
- **Rol:** `role="dialog"`, `aria-modal="true"`
- **ARIA:** `aria-labelledby="dialog-title"`, `aria-describedby="dialog-desc"`
- **Klavye:** `Escape` ile kapanır, odak dialog içine hapsedilir (focus trap).
- **Arka Plan:** `backdrop-blur-md bg-black/60`.

## 3. Tabs Primitive (Sekmeler)
- **Rol:** `role="tablist"`
- **Sekme:** `role="tab"`, `aria-selected={isSelected}`, `aria-controls={panelId}`
- **Panel:** `role="tabpanel"`, `tabIndex={0}`
- **Klavye:** Sol/Sağ ok tuşlarıyla sekmeler arası odak kaydırma.
- **Stil:** Mercury tarzı hap (`rounded-full`) veya alt çizgi göstergesi.

## 4. Meter / Progress Primitive (İlerleme ve Sayaç)
- **Rol:** `role="meter"` veya `role="progressbar"`
- **ARIA:** `aria-valuenow={current}`, `aria-valuemin={0}`, `aria-valuemax={max}`, `aria-valuetext={formatted}`
- **Stil:** Yuvarlatılmış parça (`rounded-full overflow-hidden`), içeride yumuşak dolgu animasyonu.
