# Design System

<!-- impeccable:design-schema 1 -->

## World

**Meti: Energía y Conexión**

Meti habita en el mundo de la **confianza activa** — donde la sabiduría profesional se encuentra con la tecnología accesible. No es corporativa ni fría; es vibrante, directa y humana. El mundo de Meti es el de las conexiones que importan: un abogado que clarifica una duda compleja, un coach que transforma una carrera, un financiero que da seguridad en decisiones críticas.

**Cultural home:** La intersección entre SaaS moderno (Linear, Notion) y plataformas de servicios humanos (Airbnb Experiences, Masterclass). La energía de una startup tech con la calidez de un servicio personal.

**Physical scene:** Profesionales trabajando desde hogares y oficinas pequeñas, conectándose con clientes a través de pantallas. La plataforma debe sentirse como un espacio profesional, acogedor y eficiente — no como un formulario frío ni como una app sobreestilizada.

## Voice and Tone

- **Directo:** Sin rodeos, claro en acciones y precios
- **Confiable:** Profesional pero accesible, nunca arrogante ni genérico
- **Empoderador:** El asesor se siente dueño de su negocio; el cliente se siente seguro de su elección
- **Transparente:** Sin letra pequeña, sin sorpresas, sin ocultar información

## Color Strategy

**Dark-first, alto contraste.** Escena: profesionales y clientes frente a pantallas durante largas sesiones; el fondo oscuro da carácter y reduce la fatiga visual. El tema claro sigue disponible con el toggle, pero el tema por defecto es oscuro (sin seguir el sistema).

```
Fondo:          #09090b   (background)
Superficie:     #111114   (cards, sidebars)
Elevada:        #18181d   (hover, popovers, tarjetas flotantes)
Borde:          #2a2a32   (hairlines; la profundidad la dan bordes, no sombras)
Texto:          #f6f6f8 / #cdcdd6 / #9d9daa  (primario / secundario / apagado, todos AA)

Primario:       #ff7a47 (naranja) — acción y marca; texto SOBRE primario = #16100d (--on-primary), nunca blanco
Acento:         #2de2bd (turquesa) — disponibilidad, éxito; texto sobre acento = --on-accent
Semánticos:     success #3ddc97, warning #fbbf24, error #ff7b7b, info #6aa9ff
```

Reglas: superficies en escalera (fondo < superficie < elevada); un solo color de acción por vista; los bloques sólidos naranja (CTA) llevan texto oscuro.

## Typography

- **Títulos:** Bricolage Grotesque (600–800) — carácter propio, tracking ajustado.
- **Cuerpo / UI:** Geist.
- **Datos (horas, etiquetas, precios técnicos):** Geist Mono; clase `.eyebrow` para etiquetas y `.tabular` para cifras alineadas.

Escala: Display 56–72px, H1 40px, H2 32px, H3 24px, cuerpo 16px, small 14px, caption 12px.

## Signature Motifs

- Fondo con rejilla fina (`.bg-grid`) y resplandor naranja/turquesa en el hero.
- Agenda como lenguaje visual: franjas diagonales (`.hatch`) para horarios no disponibles, citas con borde izquierdo naranja.

## Component Language

**Buttons:**
- Primary: Fondo #FF6B35, texto blanco, hover #E55A2B
- Secondary: Fondo transparente, borde #1A1A2E, texto #1A1A2E
- Ghost: Fondo transparente, texto #FF6B35
- Border radius: 8px (consistente)

**Cards:**
- Fondo blanco, sombra sutil (0 1px 3px rgba(0,0,0,0.1))
- Hover: sombra ligeramente más intensa
- Border radius: 12px
- Padding: 24px

**Inputs:**
- Border: 1px solid #E5E7EB
- Focus: border #FF6B35, ring 2px rgba(255,107,53,0.2)
- Border radius: 8px
- Height: 44px (mínimo para touch targets)

**Navigation:**
- Sticky header, fondo blanco con blur backdrop
- Logo a la izquierda, links al centro, CTA a la derecha
- Mobile: hamburger menu con slide-in

**Rating Stars:**
- Color: #FBBF24
- Tamaño: 16px-20px
- Vacías: #E5E7EB

## Spacing and Layout

**Base unit:** 4px

**Spacing scale:**
```
1:  4px
2:  8px
3:  12px
4:  16px
5:  20px
6:  24px
8:  32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

**Layout:**
- Max width: 1280px (container)
- Grid: 12 columnas, gap 24px
- Responsive breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)

## Imagery and Illustration

**Fotografía:**
- Personas reales (no stock genérico)
- Profesionales en ambientes de trabajo reales
- Colores naturales, iluminación suave
- Composición: personas como protagonistas, no decorativas

**Ilustraciones:**
- Estilo lineal con acentos de color (#FF6B35, #00D4AA)
- No cartoon, no 3D renders
- Funcional: explicar conceptos, no decorar

**Iconos:**
- Lucide React (consistentes, limpios)
- Tamaño: 20px-24px en UI, 32px-48px en features
- Color: hereda del texto o usa acento

## Motion

**Principios:**
- Funcional: guiar la atención, no entretener
- Rápido: 150ms-300ms para transiciones de estado
- Suave: ease-out para entradas, ease-in-out para movimientos

**Animaciones principales:**
- Fade in: elementos aparecen con opacidad de 0 a 1
- Slide up: contenido entra desde abajo (20px offset)
- Scale: botones y cards en hover (1.02 scale)
- Skeleton: carga de contenido con shimmer

## Signature Interactions

1. **Video Preview en Hover:** Las tarjetas de asesor muestran un preview del video de presentación al pasar el mouse (auto-play, muted)
2. **Booking Widget Sticky:** En el perfil del asesor, el widget de reserva se mantiene visible al hacer scroll
3. **Slot Selection Animado:** Los horarios disponibles aparecen con una transición escalonada
4. **Fee Transparency:** En checkout, el desglose de precio se muestra con una animación de revelación
5. **Rating Interaction:** Las estrellas de calificación tienen un micro-animación al seleccionar

## Accessibility

- Contraste mínimo WCAG AA (4.5:1 para texto, 3:1 para gráficos)
- Focus visible en todos los elementos interactivos
- Skip links para navegación por teclado
- ARIA labels en componentes complejos
- Alt text en todas las imágenes
- Reduced motion: respetar prefers-reduced-motion

## Responsive Behavior

**Mobile (0-640px):**
- Stack vertical de contenido
- Bottom navigation para acciones principales
- Cards a ancho completo
- Booking widget como bottom sheet

**Tablet (641-1024px):**
- Grid de 2 columnas para cards
- Sidebar colapsable en dashboard

**Desktop (1025px+):**
- Grid de 3-4 columnas para cards
- Sidebar permanente en dashboard
- Booking widget sticky en perfil
