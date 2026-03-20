export type LangCode = "en" | "so" | "ar" | "es" | "fr";

export interface Strings {
  appName: string;
  appTagline: string;
  // tabs
  matches: string;
  live: string;
  schedule: string;
  settings: string;
  // filters
  all: string;
  upcoming: string;
  finished: string;
  allLeagues: string;
  // matches screen
  noMatchesFound: string;
  tryDifferentFilter: string;
  liveCountSuffix: string;
  // live screen
  noLiveFootball: string;
  checkBackWhen: string;
  liveMatchesLabel: string;
  // schedule screen
  fixturesSubtitle: string;
  noFixtures: string;
  yesterday: string;
  today: string;
  tomorrow: string;
  // settings screen
  personalise: string;
  notifications: string;
  matchAlerts: string;
  matchAlertsDesc: string;
  goalNotifications: string;
  goalNotificationsDesc: string;
  pushNotifications: string;
  pushNotificationsDesc: string;
  subscribed: string;
  subscribe: string;
  language: string;
  theme: string;
  darkMode: string;
  darkModeDesc: string;
  defaultLabel: string;
  about: string;
  footballLiveEverywhere: string;
  // match card
  watchLabel: string;
  highlightsLabel: string;
  // admin
  adminTitle: string;
  adminSubtitle: string;
  adminPassword: string;
  adminUnlock: string;
  adminWrongPassword: string;
  adminStreamUrl: string;
  adminSave: string;
  adminSaved: string;
  adminMatchList: string;
}

const translations: Record<LangCode, Strings> = {
  en: {
    appName: "GoalHub",
    appTagline: "Football · Live · Everywhere",
    matches: "Matches",
    live: "Live",
    schedule: "Schedule",
    settings: "Settings",
    all: "All",
    upcoming: "Upcoming",
    finished: "Finished",
    allLeagues: "All Leagues",
    noMatchesFound: "No matches found",
    tryDifferentFilter: "Try a different filter",
    liveCountSuffix: "live",
    noLiveFootball: "No Live Football",
    checkBackWhen: "Check back when matches are in progress",
    liveMatchesLabel: "LIVE MATCHES",
    fixturesSubtitle: "Football fixtures & results",
    noFixtures: "No fixtures scheduled",
    yesterday: "Yesterday",
    today: "Today",
    tomorrow: "Tomorrow",
    personalise: "Personalise your GoalHub",
    notifications: "Notifications",
    matchAlerts: "Match Alerts",
    matchAlertsDesc: "Notify when a match goes live",
    goalNotifications: "Goal Notifications",
    goalNotificationsDesc: "Instant alert for every goal",
    pushNotifications: "Push Notifications",
    pushNotificationsDesc: "Receive alerts on your device",
    subscribed: "Subscribed ✓",
    subscribe: "Subscribe",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    darkModeDesc: "Midnight Blue · Always on",
    defaultLabel: "Default",
    about: "About",
    footballLiveEverywhere: "Football · Live · Everywhere",
    watchLabel: "Watch",
    highlightsLabel: "🎬 Highlights",
    adminTitle: "Admin Panel",
    adminSubtitle: "Manage live stream URLs",
    adminPassword: "Enter admin password",
    adminUnlock: "Unlock",
    adminWrongPassword: "Incorrect password",
    adminStreamUrl: "Stream URL (.m3u8 or mp4)",
    adminSave: "Save",
    adminSaved: "Saved ✓",
    adminMatchList: "Match Streams",
  },

  so: {
    appName: "GoalHub",
    appTagline: "Kubadda Cagta · Toos · Meel Kasta",
    matches: "Ciyaaraha",
    live: "Toos",
    schedule: "Jadwalka",
    settings: "Dejinta",
    all: "Dhammaan",
    upcoming: "Kusosocdaa",
    finished: "Dhammaatay",
    allLeagues: "Dhammaan Liigayaasha",
    noMatchesFound: "Ciyaar lama helin",
    tryDifferentFilter: "Isku day shaandhayn kale",
    liveCountSuffix: "toos",
    noLiveFootball: "Ciyaar Toos ah Kuma Jiro",
    checkBackWhen: "Ku soo laabo marka ciyaaraha socaan",
    liveMatchesLabel: "CIYAARAHA TOOSKA AH",
    fixturesSubtitle: "Jadwalka kubadda cagta iyo natiijooyinka",
    noFixtures: "Ciyaar jadwal ah lama haynin",
    yesterday: "Shalay",
    today: "Maanta",
    tomorrow: "Berri",
    personalise: "GoalHub u habbee adiga",
    notifications: "Ogeysiisyada",
    matchAlerts: "Digniinaha Ciyaarta",
    matchAlertsDesc: "La soco marka ciyaartu bilaabato",
    goalNotifications: "Ogeysiisyada Goollada",
    goalNotificationsDesc: "Ogeysiis deg-deg ah gool kasta",
    pushNotifications: "Ogeysiisyada Tooska",
    pushNotificationsDesc: "Hel ogeysiisyo tooska telefoonkaaga",
    subscribed: "Isdiiwaangeliyay ✓",
    subscribe: "Isdiiwaangeli",
    language: "Luqadda",
    theme: "Muuqaalka",
    darkMode: "Qaabka Madow",
    darkModeDesc: "Buluuga Habeenka · Had iyo jeer",
    defaultLabel: "Caadiga",
    about: "Ku Saabsan",
    footballLiveEverywhere: "Kubadda Cagta · Toos · Meel Kasta",
    watchLabel: "Arag",
    highlightsLabel: "🎬 Muuqaallada",
    adminTitle: "Xafiiska Maamulaha",
    adminSubtitle: "Maaree joogga tooska ah",
    adminPassword: "Geli erayga sirta maamulaha",
    adminUnlock: "Fur",
    adminWrongPassword: "Erayga sirta waa khalad",
    adminStreamUrl: "URL-ka Joogga (.m3u8 ama mp4)",
    adminSave: "Kaydi",
    adminSaved: "La kaydiyay ✓",
    adminMatchList: "Liiska Joogga Ciyaaraha",
  },

  ar: {
    appName: "GoalHub",
    appTagline: "كرة القدم · مباشر · في كل مكان",
    matches: "المباريات",
    live: "مباشر",
    schedule: "الجدول",
    settings: "الإعدادات",
    all: "الكل",
    upcoming: "قادمة",
    finished: "منتهية",
    allLeagues: "كل الدوريات",
    noMatchesFound: "لا توجد مباريات",
    tryDifferentFilter: "جرّب تصفية مختلفة",
    liveCountSuffix: "مباشر",
    noLiveFootball: "لا مباريات مباشرة",
    checkBackWhen: "تحقق عندما تكون المباريات جارية",
    liveMatchesLabel: "المباريات المباشرة",
    fixturesSubtitle: "مواعيد مباريات كرة القدم",
    noFixtures: "لا توجد مباريات مجدولة",
    yesterday: "أمس",
    today: "اليوم",
    tomorrow: "غداً",
    personalise: "خصّص GoalHub",
    notifications: "الإشعارات",
    matchAlerts: "تنبيهات المباريات",
    matchAlertsDesc: "إشعار عند بدء المباراة مباشرة",
    goalNotifications: "إشعارات الأهداف",
    goalNotificationsDesc: "تنبيه فوري لكل هدف",
    pushNotifications: "الإشعارات الفورية",
    pushNotificationsDesc: "استقبل إشعارات على جهازك",
    subscribed: "مشترك ✓",
    subscribe: "اشترك",
    language: "اللغة",
    theme: "المظهر",
    darkMode: "الوضع الداكن",
    darkModeDesc: "أزرق منتصف الليل · دائمًا",
    defaultLabel: "افتراضي",
    about: "حول",
    footballLiveEverywhere: "كرة القدم · مباشر · في كل مكان",
    watchLabel: "شاهد",
    highlightsLabel: "🎬 الملخص",
    adminTitle: "لوحة الإدارة",
    adminSubtitle: "إدارة روابط البث المباشر",
    adminPassword: "أدخل كلمة مرور المشرف",
    adminUnlock: "فتح",
    adminWrongPassword: "كلمة المرور غير صحيحة",
    adminStreamUrl: "رابط البث (.m3u8 أو mp4)",
    adminSave: "حفظ",
    adminSaved: "تم الحفظ ✓",
    adminMatchList: "روابط المباريات",
  },

  es: {
    appName: "GoalHub",
    appTagline: "Fútbol · En Vivo · En Todas Partes",
    matches: "Partidos",
    live: "En Vivo",
    schedule: "Horario",
    settings: "Ajustes",
    all: "Todos",
    upcoming: "Próximos",
    finished: "Finalizados",
    allLeagues: "Todas las Ligas",
    noMatchesFound: "No se encontraron partidos",
    tryDifferentFilter: "Prueba otro filtro",
    liveCountSuffix: "en vivo",
    noLiveFootball: "Sin Fútbol en Directo",
    checkBackWhen: "Vuelve cuando haya partidos en curso",
    liveMatchesLabel: "EN DIRECTO",
    fixturesSubtitle: "Fixtures y resultados de fútbol",
    noFixtures: "No hay partidos programados",
    yesterday: "Ayer",
    today: "Hoy",
    tomorrow: "Mañana",
    personalise: "Personaliza tu GoalHub",
    notifications: "Notificaciones",
    matchAlerts: "Alertas de Partidos",
    matchAlertsDesc: "Notificar cuando comienza un partido",
    goalNotifications: "Notificaciones de Goles",
    goalNotificationsDesc: "Alerta instantánea por cada gol",
    pushNotifications: "Notificaciones Push",
    pushNotificationsDesc: "Recibe alertas en tu dispositivo",
    subscribed: "Suscrito ✓",
    subscribe: "Suscribirse",
    language: "Idioma",
    theme: "Tema",
    darkMode: "Modo Oscuro",
    darkModeDesc: "Azul Medianoche · Siempre activo",
    defaultLabel: "Por defecto",
    about: "Acerca de",
    footballLiveEverywhere: "Fútbol · En Vivo · En Todas Partes",
    watchLabel: "Ver",
    highlightsLabel: "🎬 Destacados",
    adminTitle: "Panel Admin",
    adminSubtitle: "Gestionar URLs de transmisión",
    adminPassword: "Ingresa la contraseña admin",
    adminUnlock: "Desbloquear",
    adminWrongPassword: "Contraseña incorrecta",
    adminStreamUrl: "URL del stream (.m3u8 o mp4)",
    adminSave: "Guardar",
    adminSaved: "Guardado ✓",
    adminMatchList: "Streams de Partidos",
  },

  fr: {
    appName: "GoalHub",
    appTagline: "Football · En Direct · Partout",
    matches: "Matchs",
    live: "En Direct",
    schedule: "Programme",
    settings: "Paramètres",
    all: "Tous",
    upcoming: "À venir",
    finished: "Terminés",
    allLeagues: "Toutes les Ligues",
    noMatchesFound: "Aucun match trouvé",
    tryDifferentFilter: "Essayez un autre filtre",
    liveCountSuffix: "en direct",
    noLiveFootball: "Pas de Football en Direct",
    checkBackWhen: "Revenez quand des matchs sont en cours",
    liveMatchesLabel: "EN DIRECT",
    fixturesSubtitle: "Calendrier et résultats de football",
    noFixtures: "Aucun match au programme",
    yesterday: "Hier",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    personalise: "Personnalisez votre GoalHub",
    notifications: "Notifications",
    matchAlerts: "Alertes de Matchs",
    matchAlertsDesc: "Notifier quand un match est en direct",
    goalNotifications: "Notifications de Buts",
    goalNotificationsDesc: "Alerte instantanée pour chaque but",
    pushNotifications: "Notifications Push",
    pushNotificationsDesc: "Recevez des alertes sur votre appareil",
    subscribed: "Abonné ✓",
    subscribe: "S'abonner",
    language: "Langue",
    theme: "Thème",
    darkMode: "Mode Sombre",
    darkModeDesc: "Bleu Nuit · Toujours actif",
    defaultLabel: "Par défaut",
    about: "À propos",
    footballLiveEverywhere: "Football · En Direct · Partout",
    watchLabel: "Regarder",
    highlightsLabel: "🎬 Résumé",
    adminTitle: "Admin",
    adminSubtitle: "Gérer les URLs de diffusion",
    adminPassword: "Saisissez le mot de passe admin",
    adminUnlock: "Déverrouiller",
    adminWrongPassword: "Mot de passe incorrect",
    adminStreamUrl: "URL du flux (.m3u8 ou mp4)",
    adminSave: "Enregistrer",
    adminSaved: "Enregistré ✓",
    adminMatchList: "Flux des matchs",
  },
};

export default translations;
