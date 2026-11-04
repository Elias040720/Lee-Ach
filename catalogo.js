/*
 * LEE-ACH — base de datos editorial de ejemplo.
 * IMPORTANTE: los perfiles de abajo NO son productos reales ni stock publicado.
 * Para activar comercio se requiere un catálogo oficial validado con nombres,
 * fotos autorizadas, precios PEN y stock por cada presentación.
 */
window.LEEACH_SETTINGS = Object.freeze({
  brand: 'LEE-ACH',
  currency: 'PEN',
  decantSizes: [3, 5, 10, 30],
  whatsapp: null,
  checkoutEnabled: false,
  catalogVerified: false
});

window.LEEACH_CATALOG = [
  {
    id:'citrico-luminoso', name:'Cítrico luminoso', category:'disenador', audience:'unisex',
    family:'citrica', intensity:'suave', occasions:['dia','oficina'],
    notes:['Bergamota','Limón','Almizcle'],
    description:'Un perfil limpio y luminoso, inspirado en la sensación de un comienzo fresco.',
    image:'assets/decants-editorial.webp', imagePosition:'center center', sizes:[3,5,10,30],
    sample:true, variants:{}
  },
  {
    id:'ambar-nocturno', name:'Ámbar nocturno', category:'arabe', audience:'masculino',
    family:'oriental', intensity:'intensa', occasions:['noche','especial'],
    notes:['Ámbar','Especias','Maderas'],
    description:'Calidez especiada y profundidad para quienes disfrutan de un carácter envolvente.',
    image:'assets/perfume-editorial.webp', imagePosition:'center center', sizes:[3,5,10,30],
    sample:true, variants:{}
  },
  {
    id:'flores-blancas', name:'Flores blancas', category:'nicho', audience:'femenino',
    family:'floral', intensity:'suave', occasions:['dia','especial'],
    notes:['Jazmín','Flor de azahar','Almizcle'],
    description:'Una interpretación delicada y expresiva del universo floral.',
    image:'assets/hero-perfumeria.webp', imagePosition:'85% center', sizes:[3,5,10,30],
    sample:true, variants:{}
  },
  {
    id:'madera-serena', name:'Madera serena', category:'nicho', audience:'unisex',
    family:'amaderada', intensity:'media', occasions:['oficina','noche'],
    notes:['Cedro','Vetiver','Sándalo'],
    description:'Un equilibrio entre serenidad, textura y una estela de madera seca.',
    image:'assets/perfume-editorial.webp', imagePosition:'center 35%', sizes:[3,5,10,30],
    sample:true, variants:{}
  },
  {
    id:'vainilla-intensa', name:'Vainilla intensa', category:'arabe', audience:'femenino',
    family:'gourmand', intensity:'intensa', occasions:['noche','especial'],
    notes:['Vainilla','Tonka','Ámbar'],
    description:'Dulzura cálida y una personalidad que busca dejar recuerdo.',
    image:'assets/decants-editorial.webp', imagePosition:'65% center', sizes:[3,5,10,30],
    sample:true, variants:{}
  },
  {
    id:'azul-contemporaneo', name:'Azul contemporáneo', category:'disenador', audience:'masculino',
    family:'aromatica', intensity:'media', occasions:['dia','oficina'],
    notes:['Lavanda','Aromáticas','Madera'],
    description:'Un carácter aromático y versátil, de líneas claras y modernas.',
    image:'assets/hero-perfumeria.webp', imagePosition:'78% center', sizes:[3,5,10,30],
    sample:true, variants:{}
  }
];
