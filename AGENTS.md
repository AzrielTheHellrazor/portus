# Portus Development & Design Directives

## 1. Öncelik Sırası (Hierarchy of Authority)
Herhangi bir UI bileşeni, sayfa düzeni veya stil geliştirilirken öncelik sırası şöyledir:
1. **Portus Marka Kimliği & Renk Token'ları:** Bu dosyadaki zümrüt, pirinç ve obsidyen token'ları birincil ve mutlaktır.
2. **Mercury Yapı, Spacing & Tipografi Ölçeği:** Yapısal kurallar için `@docs/DESIGN.md` izlenir.
3. **Base UI Erişilebilir Primitives:** Durum yönetimi ve erişilebilirlik için `.agents/skills/base-ui/SKILL.md` geçerlidir.
4. **Obsidian UI Koyu Yüzey Katmanları:** Koyu tema derinliği ve kontrast için `.agents/skills/obsidian-ui/SKILL.md` geçerlidir.

---

## 2. Portus Renk & Tipografi Token'ları

### Zümrüt (Sovereign Pine / Emerald)
- **Koyu Zemin Üzerinde:** `--color-pine-light: #10B981` (İkincil zümrüt: `#065F46`, Durum: 200 OK, Başarı)
- **Açık Zemin Üzerinde:** `--color-pine: #0B3B2C` (Kurumsal koyu çam, WCAG AAA `> 9.8:1`)

### Pirinç (Clearinghouse Brass)
- **Koyu Zemin Üzerinde:** `--color-brass-light: #D4A24C` (HTTP 402 rozeti, CFO butonları, WCAG AAA `> 8.35:1`)
- **Açık Zemin Üzerinde:** `--color-brass: #785316` (WCAG AAA `> 6.3:1`)

### Obsidyen Zeminler (Obsidian Palette)
- **Kök Kanvas:** `--surface-canvas: #0C0F14`
- **Kart Yüzeyi:** `--surface-raised: #12161F`
- **Yükseltilmiş Yüzey:** `--surface-overlay: #181E29`
- **Hairline Kenarlık:** `border: 1px solid rgba(255, 255, 255, 0.08)`

### Tabular-Nums Mono Rakam Kuralı
- Tüm parasal tutarlar (`EURC`, `USDC`), döviz kurları, cüzdan/kontrat adresleri, işlem hash'leri, sayaçlar ve blok numaraları istisnasız `font-mono tabular-nums` sınıfıyla yazılmalıdır.

---

## 3. KESİN KURAL: İndigo / Mor Kullanma (Strict Ban on Indigo/Violet)
- Mercury tasarım sisteminde yer alan `#5266eb` (indigo/mor), `#9cb4e8` (periwinkle), `#edecfb` (lavender) veya ink-violet tonları **KESİNLİKLE KULLANILMAYACAKTIR**.
- Mercury'den **yalnızca** yapısal öğeler alınır: hap (pill) buton geometrisi (`rounded-full`), kart kavisleri (`rounded-2xl` / `rounded-3xl`), boşluk ölçekleri ve tipografi hiyerarşisi.
- Mercury'nin birincil buton rengi yerine Portus Zümrüt (`#0B3B2C` / `#10B981`) ve Pirinç (`#D4A24C`) kullanılır.

---

## 4. Tasarım Sistemi Referansı
Tüm spacing ölçekleri, kart yapıları ve tipografik hiyerarşi için referans:
`@docs/DESIGN.md`

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Runtime Policy
Always prefer `bun` (`bun run`, `bun test`, `bunx`) over `npm` or `node`.
<!-- END:nextjs-agent-rules -->
