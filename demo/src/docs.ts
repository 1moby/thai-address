export const SUPPORTED_ADDRESS_INPUT_LANGUAGES = ["th", "en"] as const;

export const THAI_LANDING_COPY = {
  locale: "th",
  title: "กรอกที่อยู่ไทยให้เป็นข้อมูลพร้อมใช้",
  lead:
    "thai-address เป็นไลบรารีฝั่งเบราว์เซอร์สำหรับค้นหาและแยกที่อยู่ไทยเป็นฟิลด์ โดยใช้ข้อมูลราชการขนาดเล็กและไม่ส่งข้อความที่อยู่กลับไปที่เซิร์ฟเวอร์",
  parserScope: "ตัวแยกที่อยู่รับข้อความที่อยู่ภาษาไทยและภาษาอังกฤษเท่านั้น หน้าเอกสารหลายภาษาเป็นคำอธิบายการใช้งาน ไม่ใช่การเพิ่มภาษาที่อยู่",
  languageHeading: "เอกสารภาษาอื่น",
  demoHeading: "ทดลองแยกที่อยู่",
  dataHeading: "ข้อมูลและการเผยแพร่"
};

export interface LocalizedDocPage {
  slug: string;
  route: string;
  htmlLang: string;
  dir: "ltr" | "rtl";
  flag: string;
  thaiName: string;
  nativeName: string;
  title: string;
  lead: string;
  supportNote: string;
  installTitle: string;
  installBody: string;
  usageTitle: string;
  usageBody: string;
  dataTitle: string;
  dataBody: string;
  fieldsTitle: string;
  fields: string[];
  isDocumentationOnly: true;
  supportedAddressInputLanguages: typeof SUPPORTED_ADDRESS_INPUT_LANGUAGES;
}

const sharedFields = [
  "houseNumber, building, floor, unit",
  "moo, soi, road, phone",
  "subdistrict, district, province, postalCode",
  "Thai and English administrative names when available"
];

export const DOC_LANGUAGES: LocalizedDocPage[] = [
  {
    slug: "en",
    route: "/docs/en/",
    htmlLang: "en",
    dir: "ltr",
    flag: "🇬🇧",
    thaiName: "อังกฤษ",
    nativeName: "English",
    title: "thai-address documentation",
    lead: "A compact browser-only Thai address autocomplete and parser for production forms.",
    supportNote: "Documentation is translated here, but address parsing accepts Thai and English address text only.",
    installTitle: "Install",
    installBody: "Install the package, load the gzipped data file, then create an index in the browser.",
    usageTitle: "Use",
    usageBody: "Search official administrative areas or parse a pasted free-form Thai address into structured fields.",
    dataTitle: "Data",
    dataBody: "The default data comes from DOPA STAT-BORA CCAATT and excludes disposed or canceled entries.",
    fieldsTitle: "Returned fields",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "zh",
    route: "/docs/zh/",
    htmlLang: "zh",
    dir: "ltr",
    flag: "🇨🇳",
    thaiName: "จีน",
    nativeName: "中文",
    title: "thai-address 文档",
    lead: "一个紧凑的浏览器端泰国地址自动完成与解析库，适合生产环境表单。",
    supportNote: "这里翻译的是文档；地址解析本身只接受泰语和英语地址文本。",
    installTitle: "安装",
    installBody: "安装包，载入 gzip 数据文件，然后在浏览器中建立索引。",
    usageTitle: "使用",
    usageBody: "可以搜索官方行政区，也可以把自由格式的泰国地址解析成结构化字段。",
    dataTitle: "数据",
    dataBody: "默认数据来自 DOPA STAT-BORA CCAATT，并排除已注销或取消的记录。",
    fieldsTitle: "返回字段",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "hi",
    route: "/docs/hi/",
    htmlLang: "hi",
    dir: "ltr",
    flag: "🇮🇳",
    thaiName: "ฮินดี",
    nativeName: "हिन्दी",
    title: "thai-address दस्तावेज़",
    lead: "उत्पादन फ़ॉर्म के लिए छोटा, ब्राउज़र में चलने वाला Thai address autocomplete और parser.",
    supportNote: "यह पृष्ठ केवल दस्तावेज़ का अनुवाद है; address parsing केवल Thai और English address text स्वीकार करता है.",
    installTitle: "इंस्टॉल",
    installBody: "package इंस्टॉल करें, gzip data file लोड करें, और browser में index बनाएं.",
    usageTitle: "उपयोग",
    usageBody: "official administrative areas खोजें या pasted Thai address को structured fields में parse करें.",
    dataTitle: "डेटा",
    dataBody: "default data DOPA STAT-BORA CCAATT से आता है और disposed या canceled entries हटाता है.",
    fieldsTitle: "returned fields",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "es",
    route: "/docs/es/",
    htmlLang: "es",
    dir: "ltr",
    flag: "🇪🇸",
    thaiName: "สเปน",
    nativeName: "Español",
    title: "Documentación de thai-address",
    lead: "Autocompletado y parser compacto de direcciones tailandesas, ejecutado solo en el navegador.",
    supportNote: "Esta página traduce la documentación; el parser solo acepta direcciones en tailandés e inglés.",
    installTitle: "Instalación",
    installBody: "Instala el paquete, carga el archivo de datos gzip y crea el índice en el navegador.",
    usageTitle: "Uso",
    usageBody: "Busca áreas administrativas oficiales o convierte una dirección tailandesa libre en campos estructurados.",
    dataTitle: "Datos",
    dataBody: "Los datos predeterminados vienen de DOPA STAT-BORA CCAATT y excluyen entradas dadas de baja o canceladas.",
    fieldsTitle: "Campos devueltos",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "fr",
    route: "/docs/fr/",
    htmlLang: "fr",
    dir: "ltr",
    flag: "🇫🇷",
    thaiName: "ฝรั่งเศส",
    nativeName: "Français",
    title: "Documentation de thai-address",
    lead: "Une bibliothèque compacte, côté navigateur, pour l'autocomplétion et l'analyse des adresses thaïlandaises.",
    supportNote: "Cette page traduit seulement la documentation; l'analyse accepte uniquement les adresses en thaï et en anglais.",
    installTitle: "Installation",
    installBody: "Installez le paquet, chargez le fichier de données gzip, puis créez l'index dans le navigateur.",
    usageTitle: "Utilisation",
    usageBody: "Recherchez les zones administratives officielles ou analysez une adresse thaïlandaise libre en champs structurés.",
    dataTitle: "Données",
    dataBody: "Les données par défaut viennent de DOPA STAT-BORA CCAATT et excluent les entrées supprimées ou annulées.",
    fieldsTitle: "Champs retournés",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "ar",
    route: "/docs/ar/",
    htmlLang: "ar",
    dir: "rtl",
    flag: "🇸🇦",
    thaiName: "อาหรับ",
    nativeName: "العربية",
    title: "توثيق thai-address",
    lead: "مكتبة صغيرة تعمل في المتصفح فقط للإكمال التلقائي وتحليل العناوين التايلاندية.",
    supportNote: "هذه الصفحة ترجمة للوثائق فقط؛ تحليل العناوين يقبل نص العنوان بالتايلاندية والإنجليزية فقط.",
    installTitle: "التثبيت",
    installBody: "ثبّت الحزمة، حمّل ملف البيانات المضغوط gzip، ثم أنشئ الفهرس داخل المتصفح.",
    usageTitle: "الاستخدام",
    usageBody: "ابحث في المناطق الإدارية الرسمية أو حوّل عنوانا تايلانديا حرا إلى حقول منظمة.",
    dataTitle: "البيانات",
    dataBody: "تأتي البيانات الافتراضية من DOPA STAT-BORA CCAATT وتستبعد السجلات الملغاة أو المتوقفة.",
    fieldsTitle: "الحقول الناتجة",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "bn",
    route: "/docs/bn/",
    htmlLang: "bn",
    dir: "ltr",
    flag: "🇧🇩",
    thaiName: "เบงกาลี",
    nativeName: "বাংলা",
    title: "thai-address ডকুমেন্টেশন",
    lead: "প্রোডাকশন ফর্মের জন্য ছোট, browser-only Thai address autocomplete ও parser.",
    supportNote: "এই পৃষ্ঠায় শুধু ডকুমেন্টেশন অনুবাদ করা হয়েছে; address parsing শুধু Thai ও English address text গ্রহণ করে.",
    installTitle: "ইনস্টল",
    installBody: "package ইনস্টল করুন, gzip data file load করুন, তারপর browser-এ index তৈরি করুন.",
    usageTitle: "ব্যবহার",
    usageBody: "official administrative area খুঁজুন বা pasted Thai address structured fields-এ parse করুন.",
    dataTitle: "ডেটা",
    dataBody: "default data DOPA STAT-BORA CCAATT থেকে আসে এবং disposed বা canceled entries বাদ দেয়.",
    fieldsTitle: "returned fields",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "pt",
    route: "/docs/pt/",
    htmlLang: "pt",
    dir: "ltr",
    flag: "🇵🇹",
    thaiName: "โปรตุเกส",
    nativeName: "Português",
    title: "Documentação do thai-address",
    lead: "Autocomplete e parser compacto de endereços tailandeses, executado apenas no navegador.",
    supportNote: "Esta página traduz apenas a documentação; o parser aceita somente texto de endereço em tailandês e inglês.",
    installTitle: "Instalação",
    installBody: "Instale o pacote, carregue o arquivo de dados gzip e crie o índice no navegador.",
    usageTitle: "Uso",
    usageBody: "Pesquise áreas administrativas oficiais ou transforme um endereço tailandês livre em campos estruturados.",
    dataTitle: "Dados",
    dataBody: "Os dados padrão vêm de DOPA STAT-BORA CCAATT e excluem registros baixados ou cancelados.",
    fieldsTitle: "Campos retornados",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "ru",
    route: "/docs/ru/",
    htmlLang: "ru",
    dir: "ltr",
    flag: "🇷🇺",
    thaiName: "รัสเซีย",
    nativeName: "Русский",
    title: "Документация thai-address",
    lead: "Компактная browser-only библиотека для автодополнения и разбора тайских адресов.",
    supportNote: "Эта страница переводит только документацию; parser принимает адресный текст только на тайском и английском.",
    installTitle: "Установка",
    installBody: "Установите пакет, загрузите gzip файл данных и создайте индекс в браузере.",
    usageTitle: "Использование",
    usageBody: "Ищите официальные административные области или разбирайте свободный тайский адрес на структурированные поля.",
    dataTitle: "Данные",
    dataBody: "Данные по умолчанию взяты из DOPA STAT-BORA CCAATT и исключают списанные или отмененные записи.",
    fieldsTitle: "Возвращаемые поля",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  },
  {
    slug: "ur",
    route: "/docs/ur/",
    htmlLang: "ur",
    dir: "rtl",
    flag: "🇵🇰",
    thaiName: "อูรดู",
    nativeName: "اردو",
    title: "thai-address دستاویزات",
    lead: "تھائی پتوں کے autocomplete اور parser کے لیے ایک چھوٹی browser-only لائبریری۔",
    supportNote: "یہ صفحہ صرف دستاویزات کا ترجمہ ہے؛ address parsing صرف Thai اور English address text قبول کرتا ہے۔",
    installTitle: "انسٹال",
    installBody: "package انسٹال کریں، gzip data file load کریں، پھر browser میں index بنائیں۔",
    usageTitle: "استعمال",
    usageBody: "official administrative areas تلاش کریں یا pasted Thai address کو structured fields میں parse کریں۔",
    dataTitle: "ڈیٹا",
    dataBody: "default data DOPA STAT-BORA CCAATT سے آتا ہے اور disposed یا canceled entries کو خارج کرتا ہے۔",
    fieldsTitle: "returned fields",
    fields: sharedFields,
    isDocumentationOnly: true,
    supportedAddressInputLanguages: SUPPORTED_ADDRESS_INPUT_LANGUAGES
  }
];

export function getDocBySlug(slug: string): LocalizedDocPage | undefined {
  return DOC_LANGUAGES.find((language) => language.slug === slug);
}
