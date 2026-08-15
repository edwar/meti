# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Asesores (Profesionales):**
- Profesionales independientes de diversos rubros (legal, financiero, salud, tecnología, educación, etc.)
- Quieren monetizar su experiencia ofreciendo asesorías por videollamada
- Necesitan control total sobre su agenda, precios y disponibilidad
- Buscan una plataforma que les facilite la gestión sin complicaciones técnicas

**Clientes:**
- Personas naturales y PyMEs que buscan asesoría profesional especializada
- Prefieren la comodidad de atenderse desde cualquier lugar (100% online)
- Valoran la transparencia de precios y la facilidad de agendado
- Quieren una experiencia segura y profesional

**Administradores:**
- Equipo de Meti encargado de gestionar la plataforma
- Nivel Superadmin: Control total del sistema
- Nivel Gestor: Resolución de problemas con la plataforma
- Configuran fees, supervisan operaciones, gestionan facturación

## Product Purpose

Meti conecta profesionales que quieren ofrecer asesorías con clientes que buscan orientación especializada. La plataforma elimina las barreras de geografía y logística, permitiendo que las asesorías ocurran por videollamada con la misma calidad que una reunión presencial.

**Éxito se define como:**
- Asesores que activan sus servicios y reciben clientes regularmente
- Clientes que encuentran el asesor adecuado y completan asesorías satisfactorias
- Transacciones de pago fluidas y transparentes
- Retención de asesores satisfechos con la plataforma

## Positioning

Meti se diferencia por:
- **Modelo de precio justo:** El asesor define cuánto quiere ganar; la plataforma añade un fee transparente, no oculta comisiones
- **Gestión de agenda potente:** Configuración recurrente por día de semana, almuerzos, brechas entre citas, sin límite de citas diarias
- **100% online con chat:** Videollamada integrada + chat de texto para compartir información durante la asesoría
- **Promociones flexibles:** Los asesores pueden crear descuentos por fechas especiales cuando lo consideren
- **Política clara de cancelación:** Reagendar siempre gratis (con anticipación mínima configurable), cancelar sin devolución

## Operating Context

- **Flujo del cliente:** Buscar → Explorar perfiles → Seleccionar servicio → Elegir fecha/horario → Pagar con Mercado Pago → Unirse a videollamada → Calificar
- **Flujo del asesor:** Registrar → Configurar perfil y credenciales MP → Crear servicios → Definir horarios → (Opcional) Crear promociones → Atender asesorías → Recibir facturación mensual
- **Flujo del admin:** Gestionar asesores → Configurar fees y precios mínimos → Supervisar transacciones → Generar facturas de cobro de fees
- **Pagos:** Mercado Pago Checkout PRO, cada asesor usa sus propias credenciales (modelo sin custodia)
- **Videollamada:** LiveKit Cloud con grabación automática
- **Notificaciones:** Sileo para alertas de booking, recordatorios y actualizaciones

## Capabilities and Constraints

**Capacidades confirmadas:**
- Autenticación con Google OAuth (better-auth)
- Múltiples servicios por asesor con duración y precio variable
- Horarios recurrentes por día de semana (configuración por el asesor)
- Generación automática de slots disponibles
- Booking con confirmación automática al pagar
- Checkout con Mercado Pago (cada asesor registra sus credenciales)
- Videollamada LiveKit con chat de texto y grabación
- Sistema de reseñas (rating 1-5 + comentario)
- Promociones por fechas especiales (descuento porcentaje o monto fijo)
- Panel admin con configuración de fees y precios mínimos
- Facturación mensual desglosada para asesores

**Restricciones:**
- No se permiten asesorías gratis (tope mínimo configurable por admin)
- El fee es markup (se añade al precio del asesor, no se descuenta)
- Cancelación: reagendar gratis con anticipación mínima (configurable por servicio), cancelar/no-show sin devolución
- Modalidad: 100% online (videollamada obligatoria)
- Pago: solo vía Mercado Pago (sin otros métodos en MVP)

**Decisiones abiertas:**
- Grabación de videollamadas: almacenamiento en bucket del asesor o de la plataforma
- Soporte post-MVP: chat en vivo, SMS, push notifications

## Brand Commitments

- **Nombre:** Meti (inspirado en la diosa griega Metis, diosa de la sabiduría y la prudencia)
- **Dominio:** meti.cognilab.dev
- **Tono visual:** Energético / Bold (naranja vibrante + azul oscuro)
- **Voz:** Profesional pero cercana, directa, confiable

## Evidence on Hand

- Brief completo del producto con todas las reglas de negocio definidas
- Modelo de datos confirmado (Prisma schema pendiente de implementar)
- Flujos de usuario documentados
- Stack tecnológico definido: Next.js, TanStack Query, Zod, Tailwind, Shadcn, Sileo, Neon, Prisma, better-auth, LiveKit, Mercado Pago

## Product Principles

1. **Transparencia total:** El asesor siempre sabe cuánto gana y cuánto cobra la plataforma; el cliente ve el precio final sin sorpresas
2. **Flexibilidad para el asesor:** Control completo sobre servicios, horarios, precios y promociones
3. **Experiencia fluida para el cliente:** Desde buscar hasta agendar y asistir, el proceso debe ser rápido e intuitivo
4. **Escalabilidad sin complejidad:** Modelo sin custodia de pagos que permite crecer sin infraestructura de cobros
5. **Claridad en las reglas:** Políticas de cancelación y reagenda claras desde el primer contacto

## Accessibility & Inclusion

- Interface responsive (desktop y mobile)
- Contraste de colores WCAG AA
- Navegación por teclado
- Textos alternativos en imágenes
- Formularios accesibles con labels y validación clara
