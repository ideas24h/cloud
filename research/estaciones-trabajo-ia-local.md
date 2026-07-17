# Búsqueda filtrada: estación de trabajo para IA local (multi-GPU) + RTX A6000

Fecha: 2026-07-17. Búsqueda restringida a vendedores de España, Francia, Alemania y Países Bajos, según lo acordado.

## ⚠️ Corrección importante antes de nada: el precio real de la RTX A6000 en 2026

La hipótesis de partida (A6000 a 1.400–1.900 €, con oportunidades a ~1.300 €) **no se sostiene con los datos actuales**:

- Trackers de precios (GPUDojo, julio 2026): usada entre **~2.600 y 3.800 $** (≈ 2.400–3.500 €). La liquidación de contratos empresariales Ampere está aumentando la oferta, pero la demanda para LLM locales la absorbe.
- Wallapop (Madrid): única unidad encontrada, a **3.800 €** — https://es.wallapop.com/item/nvidia-rtx-a6000-tarjeta-grafica-workstation-1197153584
- Foros de compraventa (hardforum, enero 2026): la ganga real más baja vista fue **~2.200 $**, y se vendió en horas.
- Motivo del precio sostenido: es la última tarjeta de 48 GB con **NVLink** (dos unidades = 96 GB agrupados), muy buscada para inferencia/fine-tuning local.

**Conclusión**: 4× A6000 hoy son ~10.000–14.000 €, no ~5.500 €. Alternativas si el presupuesto era ese:
- **2× A6000 con NVLink** (96 GB) en vez de 4: ~5.000–6.500 € si se caza bien.
- **RTX 3090 usadas** (24 GB, ~600–800 €): 4 unidades = 96 GB por ~2.800 €, a cambio de más calor/ruido y sin ECC.
- Esperar: la presión de liquidación empresarial sigue creciendo; los trackers muestran tendencia bajista lenta.

Anuncios A6000 activos localizados (precio a confirmar en cada anuncio):
- Kleinanzeigen (DE): búsqueda con varios anuncios activos, incluidos vendedores con **varias unidades** — https://www.kleinanzeigen.de/s-rtx-a6000/k0
  - PNY A6000 48GB, Heilbronn — https://www.kleinanzeigen.de/s-anzeige/-pny-nvidia-rtx-a6000-48gb-gddr6-workstation-/2995844335-225-9245
  - A6000 48GB, Immenstadt (Baviera) — https://www.kleinanzeigen.de/s-anzeige/nvidia-rtx-a6000-48gb-grafikkarte/3139383216-225-5538
- eBay.de: varios anuncios de unidades usadas y bulk — https://www.ebay.de/itm/117234877058 · https://www.ebay.de/itm/127972815365 · https://www.ebay.de/itm/177783331797

## 1. HP Z8 G4 — anuncios y tiendas localizados

### Tiendas españolas (con garantía)
| Tienda | Config | Precio | Enlace |
|---|---|---|---|
| OfertasPC | Xeon Gold 6240, 64 GB, 1 TB SSD, 2 años garantía | ver web | https://www.ofertaspc.com/workstation/500-hp-workstation-z8-g4-intel-core-xeon-gold-6240-ram-64-gb-ssd-1tb.html |
| Refurbed.es | 2× Gold 6134, 128 GB, 2×1 TB SSD, Quadro RTX 5000 | 2.700 € | https://www.refurbed.es/p/hp-workstation-z8-g4/ |
| JetComputer | Gold 6128, 32 GB, 512 GB SSD + 1 TB HDD | ver web | https://www.jetcomputer.net/ordenadores-hp-z8-g4-workstation-z3z16av01 |
| Info Reacondicionados | Z8 G4 "base" configurable | ver web | https://inforeacondicionados.com/product/workstation-grafica-hp-z8-g4-base/ |
| Back Market ES | Gold 6240, 256 GB, 4 TB SSD, RTX 3080 | ver web | https://www.backmarket.es/es-es/p/hp-z8-g4-xeon-gold-6240-26-ghz-ssd-4-tb-256-gb-nvidia-geforce-rtx-3080/3dbcf3b4-048f-4645-8c07-293871e540cd |

### eBay Alemania (donde están los mejores precios sin GPU)
- 2× Gold 6134, 64 GB, 1 TB SSD, Win11 — https://www.ebay.de/itm/377091635124
- 2× Gold 6128, 64 GB, 2×512 GB SSD — https://www.ebay.de/itm/155631713764
- 2× Gold 6234, 128 GB, 2×1 TB SSD — https://www.ebay.de/itm/135149477982
- 2× Gold 6134, 128 GB, 512 GB SSD — https://www.ebay.de/itm/314735241767
- 2× Gold 6154 (36c/72t), 512 GB, 2×1,92 TB NVMe — https://www.ebay.de/itm/116257824618 ← candidata top si el precio acompaña

### Wallapop España
- Z8 G4, 2× Gold 6248R, 384 GB RAM, W5700, solo 128 h de uso — visto en búsqueda de Wallapop, localizar en https://es.wallapop.com/electronica/ordenador-workstation
- Z8 G4, 2× Gold 6154, 256 GB, 2× NVMe 1 TB — misma búsqueda

## 2. Lenovo ThinkStation P920 — anuncios localizados

- eBay.fr: 2× Gold 6154 (36 núcleos), 192 GB DDR4, 1 TB SSD, P1000 — https://www.ebay.fr/itm/314951863375 ← muy cercana a la config objetivo
- eBay.fr: 2× Gold 6154, 256 GB, 4 TB SSD, P400 — https://www.ebay.fr/itm/315154192135
- eBay.es: 2× Gold 6136, 128 GB, 512 GB NVMe — https://www.ebay.es/itm/115457509196
- eBay.de: 2× Gold 6154, 256 GB, 1 TB NVMe — https://www.ebay.de/itm/116257839507
- eBay.de: 2× Gold 5118 (24c), 32 GB — barata como base — https://www.ebay.de/itm/157737924541
- En Wallapop no hay P920 ahora mismo (solo Z4/Z8 y ThinkCentre).

## 3. Dell Precision 7920 Tower — anuncios localizados

- Back Market ES (2 años de garantía, envío gratis):
  - Gold, 128 GB, 2 TB SSD + 8 TB HDD — https://www.backmarket.es/es-es/p/dell-precision-7920-tower-xeon-gold-35-ghz-ssd-2-tb-hdd-8-tb-ram-128-gb/1e509510-5b5e-4a13-8c77-dd09ed279f22
  - Gold, 256 GB, 1 TB SSD + 16 TB HDD — https://www.backmarket.es/es-es/p/dell-precision-7920-tower-xeon-gold-31-ghz-ssd-1-tb-hdd-15-tb-ram-256-gb/c72c1ffa-459a-41be-a0ee-7804c1c517b3
  - Gold, 256 GB, 2 TB SSD — https://www.backmarket.es/es-es/p/dell-precision-7920-tower-xeon-gold-22-ghz-ssd-2-tb-hdd-15-tb-ram-256-gb/5ba970f7-25f0-417a-886f-f676b69547d9
- Refurbed.es: página de modelo con varias configs — https://www.refurbed.es/p/dell-precision-7920-tower/
- ETB-Tech (UK, envía a UE, 3 años de garantía): 2× Gold 5120, 64 GB, RTX 2000 Ada — https://www.etb-tech.com/dell-precision-7920-tower-2-x-xeon-gold-5120-2-2ghz-fourteen-core-64gb-ram-2-x-8tb-sata-7-2k-2-x-512gb-m-2-nvme-rtx-2000-ada-ws-t7920-006.html

## Recomendación

1. **Chasis**: la mejor relación calidad/precio sigue estando en eBay.de para la Z8 G4 sin GPU (varios vendedores profesionales alemanes con dual Gold + 128–512 GB). La P920 de eBay.fr con 2× Gold 6154 y 192 GB es exactamente la config objetivo. Para compra "sin sustos" en España: Back Market (2 años de garantía) u OfertasPC.
2. **GPU**: replantear el plan de 4× A6000. Con los precios de julio de 2026, la jugada racional es **2× A6000 + NVLink (96 GB)** o **4× RTX 3090 (96 GB)** según prioridad silencio/consumo vs. presupuesto. Poner alertas en Kleinanzeigen y eBay.de a <2.000 € y saltar solo si aparece.
3. **Verificar antes de comprar**: los anuncios de eBay/Kleinanzeigen bloquean el acceso automatizado, así que los precios exactos de cada enlace hay que confirmarlos a mano (los enlaces son de anuncios activos a fecha de hoy).

## Fuentes de mercado A6000
- https://gpudojo.com/a6000
- https://www.thundercompute.com/blog/nvidia-rtx-a6000-pricing
- https://hardforum.com/threads/sold-todays-sale-nvidia-rtx-a6000-used-pull-48gb-10700-cuda-cores-dual-slot.2046127/
- https://www.accio.com/plp/rtx-a6000-ebay-used

## Equivalente actual en venta nueva (Lenovo)

La sucesora directa de la P920 en el catálogo vigente de Lenovo es la **ThinkStation PX**: doble Xeon Scalable (4ª/5ª gen), hasta 2 TB DDR5 ECC, hasta 4× RTX 6000 Ada (48 GB c/u), 9 ranuras PCIe (4×5.0 + 5×4.0). Precio de entrada ~5.780–5.970 € (sin monitor); configuraciones tope con 4 GPU y CPUs Platinum superan los 60.000 €. Referencia con precio real: 2× Xeon Silver 4516Y+, 256 GB DDR5, 1 TB NVMe, 1× RTX 6000 Ada 48GB — https://www.monitors.com/products/lenovo-thinkstation-px-2x-xeon-silver-4516y-256gb-rtx-6000-ada
Fuentes: https://www.lenovo.com/es/es/p/workstations/thinkstationp/thinkstation-px-workstation/len102s0013 · https://thinkstation-specs.com/thinkstation/px/ · https://www.tuexperto.com/2024/10/29/lenovo-thinkstation-px-una-estacion-de-trabajo-para-tareas-muy-exigentes-con-diseno-flexible/

Conclusión: la PX nueva ya cuesta lo que el montaje completo de segunda mano (chasis + varias GPU). Solo compensa si se quiere garantía de fábrica/soporte empresarial o GPUs RTX 6000 Ada. Para entrada económica y ampliable, la vía de segunda mano sigue siendo muy superior en €/GB VRAM.

## Opción de entrada recomendada: segunda mano, en stock, 1 GPU con hueco para ampliar

**JANSit** (reacondicionador con tiendas en España y Portugal, jansit.es / recondicionados.jans.pt) tiene en stock justo el perfil buscado — chasis dual-Xeon con 3 ranuras para GPU, ya con una profesional Ampere instalada, y garantía real:

| Modelo | Config | GPU instalada | Precio | Garantía | Enlace |
|---|---|---|---|---|---|
| **HP Z8 G4** (recomendada) | 2× Xeon Gold 6138, 128 GB DDR4, 1 TB SSD | RTX A4000 16GB (Ampere, ECC, ~140W, 1 sola ranura) | **2.749 €** (antes 3.690 €) | 3 años | https://recondicionados.jans.pt/produto/hp-z8-g4/ |
| HP Z8 G4 (variante 96GB) | 2× Xeon Gold, 96 GB DDR4 | RTX A4000 16GB | ver web | 3 años | https://recondicionados.jans.pt/produto/workstation-recondicionada-hp-z8-g4-rtx-a4000/ |
| Lenovo P920 (alternativa) | i9-10920X 10c / config base | RTX A4000 16GB | ver web | 2 años | https://recondicionados.jans.pt/produto/lenovo-thinkstation-p920-workstation/ |
| HP Z4 G4 (opción económica, un solo socket) | i9-10980XE 18c, 32 GB | RTX A4000 16GB | **1.249 €** | ver web | https://jansit.es/workstation-reacondicionada-hp-z4-g4-i9/ |

**Por qué la Z8 G4 a 2.749 €**: chasis con 3 ranuras PCIe libres (hueco para 2 GPU más), fuente de hasta 1700W disponible en HP Z8 G4, doble Xeon Gold ya de serie (no hay que ampliar CPU para escalar cómputo), y ya trae una GPU Ampere (A4000, 16 GB, ECC, muy eficiente ~140W) como punto de partida funcional para inferencia/fine-tuning ligero. Cuando el presupuesto lo permita, se le añade una o dos A5000/A6000/3090 sin cambiar de chasis.

**Nota de la propia Z4 G4** (1.249 €) es la opción más barata si el presupuesto manda, pero es de un solo socket y con muchas menos ranuras PCIe libres — limita cuánto se puede ampliar a futuro. Para "empezar barato pero con margen real de expansión", la Z8 G4 a 2.749 € es la mejor relación.

**Limitación de esta búsqueda**: el proxy de este entorno bloquea el acceso directo (WebFetch/curl) a la mayoría de estas páginas (eBay, Kleinanzeigen, JANSit, Refurbed, Back Market todas devuelven 403), así que los precios y el stock exacto proceden de fragmentos de resultados de búsqueda, no de una visita directa a la ficha de producto. Conviene confirmar stock/precio final entrando manualmente al enlace antes de comprar.
