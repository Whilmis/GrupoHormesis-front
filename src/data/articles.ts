export interface ArticleBlock {
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list';
  content?: string;
  items?: string[]; // Para listas
  src?: string; // Para imágenes
  alt?: string; // Para imágenes
}

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  image: string;
  content: ArticleBlock[];
}

export const articlesData: Record<string, ArticleData> = {
  "el-estado-de-la-ia": {
    id: "1",
    slug: "el-estado-de-la-ia",
    title: "El Estado de la IA en Ecosistemas B2B",
    subtitle: "Descubre cómo los Modelos de Lenguaje Grandes (LLMs) están redefiniendo la arquitectura de software empresarial y la automatización de procesos a escala global.",
    category: "Reporte Anual",
    readTime: "15 min lectura",
    date: "Septiembre 2026",
    author: {
      name: "Hormesis Research Team",
      role: "Global Intelligence",
      avatar: "/hormesis_team_mockup.jpg",
      bio: "Unidad especializada en prospectiva tecnológica e investigación de mercado para ecosistemas corporativos."
    },
    image: "/insights_hero_mockup.jpg",
    content: [
      { type: 'paragraph', content: "La Inteligencia Artificial ha dejado de ser una promesa futurista para convertirse en el pilar estructural de las empresas más competitivas del mercado B2B." },
      { type: 'paragraph', content: "En nuestro último reporte, analizamos cómo la implementación de LLMs (Modelos de Lenguaje Grandes) no solo automatiza tareas repetitivas, sino que orquesta procesos completos. Ya no hablamos de simples chatbots de soporte, sino de 'Agentes Autónomos' capaces de negociar contratos, conciliar bases de datos financieras y desplegar integraciones sin intervención humana." },
      { type: 'heading', content: "El fin de las interfaces rígidas" },
      { type: 'paragraph', content: "Uno de los hallazgos más sorprendentes del reporte es la transición de las interfaces gráficas tradicionales (GUIs) hacia interfaces conversacionales híbridas (CUIs). Los usuarios corporativos ahora interactúan con sus ERPs mediante lenguaje natural, reduciendo drásticamente la curva de aprendizaje de nuevo software complejo." },
      { type: 'image', src: "/ai_workflow_mockup.jpg", alt: "Flujo de trabajo de IA" },
      { type: 'quote', content: "Para 2028, el 80% de las interfaces B2B serán invisibles. El usuario describirá su objetivo, y el sistema orquestará los módulos necesarios para cumplirlo." },
      { type: 'heading', content: "Seguridad y Privacidad" },
      { type: 'paragraph', content: "La adopción empresarial de la IA trae consigo nuevos retos. El 78% de los CTOs encuestados citan la privacidad de los datos como su principal preocupación. En Grupo Hormesis, hemos abordado esto integrando capas de 'Zero-Trust' donde los modelos se ejecutan en entornos privados aislados (On-Premise o VPCs), garantizando que la propiedad intelectual nunca abandone la red corporativa." },
      { type: 'paragraph', content: "Conclusión: La ventana de oportunidad se está cerrando. Las empresas que no inicien su transformación hacia la IA Autónoma este año, enfrentarán un rezago tecnológico irrecuperable." }
    ]
  },
  "toma-de-decisiones-datos": {
    id: "2",
    slug: "toma-de-decisiones-datos",
    title: "Toma de decisiones impulsada por Datos",
    subtitle: "Por qué los cuadros de mando interactivos están reemplazando a los reportes estáticos en las empresas líderes.",
    category: "Data Analytics",
    readTime: "5 min lectura",
    date: "Agosto 2026",
    author: {
      name: "Elena Ramírez",
      role: "Data Lead",
      avatar: "/hormesis_culture_mockup.jpg",
      bio: "Especialista en arquitecturas de Big Data y analítica predictiva. Ayuda a corporaciones a transformar datos crudos en decisiones de negocio."
    },
    image: "/insights_article1_mockup.jpg",
    content: [
      { type: 'paragraph', content: "Tomar decisiones basadas en un reporte en PDF del mes pasado es conducir un coche mirando por el retrovisor." },
      { type: 'paragraph', content: "Las empresas modernas generan terabytes de información a diario. Sin embargo, el valor no reside en la acumulación de datos, sino en la capacidad de extraer insights accionables en tiempo real." },
      { type: 'quote', content: "El objetivo final no es tener más datos, es tener menos incertidumbre." },
      { type: 'heading', content: "La arquitectura del Data Lake" },
      { type: 'paragraph', content: "En Grupo Hormesis hemos desarrollado arquitecturas de datos que permiten unificar fuentes dispersas (CRMs, ERPs, APIs externas) en un único Data Lake corporativo. A partir de ahí, construimos dashboards interactivos que permiten a los directivos hacer 'drill-down', es decir, profundizar desde una métrica global hasta el evento individual que la originó." },
      { type: 'image', src: "/crm_mockup.jpg", alt: "Dashboard analítico" },
      { type: 'paragraph', content: "La analítica prescriptiva es el siguiente paso. No solo te decimos qué pasó, sino qué deberías hacer a continuación utilizando modelos predictivos entrenados con tu propio histórico." }
    ]
  },
  "el-fin-de-los-monolitos": {
    id: "3",
    slug: "el-fin-de-los-monolitos",
    title: "El fin de los Monolitos",
    subtitle: "Cómo migrar de un ERP tradicional a un ecosistema de software modular sin interrumpir operaciones.",
    category: "Arquitectura Cloud",
    readTime: "8 min lectura",
    date: "Julio 2026",
    author: {
      name: "David Torres",
      role: "Cloud Architect",
      avatar: "/hormesis_team_mockup.jpg",
      bio: "Arquitecto de soluciones Cloud. Apasionado por la resiliencia de sistemas distribuidos y microservicios escalables."
    },
    image: "/insights_article2_mockup.jpg",
    content: [
      { type: 'paragraph', content: "El software monolítico fue la respuesta correcta en la década de los 2000. Hoy, es un ancla que impide la innovación." },
      { type: 'paragraph', content: "Cuando una empresa intenta añadir una nueva funcionalidad a su sistema Legacy y descubre que necesita 6 meses de desarrollo y riesgo de caídas generales, es momento de plantearse una arquitectura de microservicios." },
      { type: 'heading', content: "El patrón del Estrangulador (Strangler Fig)" },
      { type: 'paragraph', content: "La mayor preocupación al migrar es el 'downtime' (tiempo de inactividad). Nuestra metodología utiliza el patrón del estrangulador:" },
      { type: 'list', items: [
        "Construimos módulos modernos (microservicios) alrededor del sistema antiguo.",
        "Interceptamos las llamadas API al sistema viejo.",
        "Redirigimos progresivamente el tráfico hacia los nuevos módulos.",
        "El sistema antiguo es 'estrangulado' y puede apagarse sin interrupciones."
      ]},
      { type: 'image', src: "/api_integration_mockup.jpg", alt: "Arquitectura modular y APIs" },
      { type: 'paragraph', content: "El resultado es un ecosistema resiliente, escalable infinitamente y, lo más importante, capaz de integrar nuevas tecnologías como la IA en semanas, no en años." }
    ]
  },
  "seguridad-ia-autonoma": {
    id: "4",
    slug: "seguridad-ia-autonoma",
    title: "La seguridad en la Era de la IA Autónoma",
    subtitle: "Protocolos de confianza cero (Zero-Trust) aplicados a agentes de IA que operan sobre bases de datos sensibles.",
    category: "Ciberseguridad",
    readTime: "6 min lectura",
    date: "Junio 2026",
    author: {
      name: "Marcos Silva",
      role: "CISO",
      avatar: "/hormesis_global_presence.jpg",
      bio: "Director de Seguridad de la Información. Experto en criptografía corporativa y auditoría de sistemas distribuidos."
    },
    image: "/ai_mockup.jpg",
    content: [
      { type: 'paragraph', content: "Delegar operaciones a un Agente de IA es eficiente, pero ¿quién vigila al vigilante?" },
      { type: 'paragraph', content: "Cuando un Modelo de Lenguaje tiene acceso a ejecutar código, realizar consultas SQL a la base de datos de producción o enviar correos en nombre de la empresa, los protocolos de seguridad tradicionales perimetrales ya no son suficientes." },
      { type: 'heading', content: "Identidad y Accesos para Máquinas (IAM)" },
      { type: 'paragraph', content: "Hemos de tratar a los agentes de IA como si fueran empleados súper-productivos, pero con privilegios de acceso estrictamente limitados (Principio de Menor Privilegio). En Hormesis, implementamos un modelo de Zero-Trust donde cada acción crítica que intenta realizar un agente debe ser validada criptográficamente." },
      { type: 'quote', content: "Asume siempre que la red interna ya está comprometida. Verifica continuamente de forma estricta." },
      { type: 'image', src: "/private_app_store_mockup.jpg", alt: "Seguridad Zero Trust" },
      { type: 'paragraph', content: "Además, utilizamos 'Human-in-the-Loop' (HITL) para flujos de trabajo de alto riesgo. El agente propone la acción (por ejemplo, una transferencia financiera de alto valor), pero requiere la aprobación de un operador humano autenticado antes de su ejecución final." }
    ]
  }
};
