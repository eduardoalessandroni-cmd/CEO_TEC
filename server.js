const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const CLAVE_SUBIR = process.env.CLAVE_SUBIR || 'ceotec2024';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const TRABAJOS_JSON = path.join(__dirname, 'data', 'trabajos.json');
const CARPETA_TRABAJOS = path.join(__dirname, 'public', 'img', 'trabajos');

function leerTrabajos() {
  try {
    return JSON.parse(fs.readFileSync(TRABAJOS_JSON, 'utf-8'));
  } catch {
    return [];
  }
}

function guardarTrabajos(lista) {
  fs.writeFileSync(TRABAJOS_JSON, JSON.stringify(lista, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CARPETA_TRABAJOS),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, permitidos.includes(ext));
  }
});

const servicios = [
  {
    titulo: 'Mantenimiento de PC y Notebooks',
    descripcion: 'Limpieza, formateo, optimización de rendimiento y cambio de piezas.',
    icono: '💻'
  },
  {
    titulo: 'Reparación de Impresoras',
    descripcion: 'Diagnóstico, limpieza y solución de fallas en impresoras.',
    icono: '🖨️'
  },
  {
    titulo: 'Mantenimiento a Domicilio',
    descripcion: 'Vamos hasta tu casa o negocio para resolver el problema en el lugar.',
    icono: '🏠'
  },
  {
    titulo: 'Sistemas para Comercios',
    descripcion: 'Sistemas simples de precios y ventas para bares, kioscos y pequeños negocios.',
    icono: '🧾'
  },
  {
    titulo: 'Instalación y Configuración',
    descripcion: 'Instalación de sistema operativo, programas y configuración de equipos nuevos.',
    icono: '🛠️'
  },
  {
    titulo: 'Instalación de Cámaras',
    descripcion: 'Instalación y configuración de cámaras de seguridad para tu casa o negocio.',
    icono: '📷'
  }
];

const proyectos = [
  {
    nombre: 'Sistema de Precios para Bar',
    categoria: 'Sistema a medida',
    descripcion: 'Sistema simple para cargar y consultar precios de productos en un bar.',
    carpeta: 'bar'
  },
  {
    nombre: 'Sistema Contable',
    categoria: 'Sistema a medida',
    descripcion: 'Registro de ventas, gastos y control contable básico para un negocio pequeño.',
    carpeta: 'contable'
  }
];

function leerCapturas(carpeta) {
  const dir = path.join(__dirname, 'public', 'img', 'sistemas', carpeta);
  try {
    return fs.readdirSync(dir)
      .filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase()))
      .sort()
      .map(f => `/img/sistemas/${carpeta}/${f}`);
  } catch {
    return [];
  }
}

app.get('/', (req, res) => {
  const trabajos = leerTrabajos().slice().reverse();
  const proyectosConCapturas = proyectos.map(p => ({
    ...p,
    capturas: leerCapturas(p.carpeta)
  }));
  res.render('index', {
    servicios,
    proyectos: proyectosConCapturas,
    trabajos,
    anio: new Date().getFullYear()
  });
});

app.get('/subir', (req, res) => {
  res.render('subir', { error: null, ok: false });
});

app.post('/subir', upload.single('imagen'), (req, res) => {
  const { clave, titulo, descripcion } = req.body;

  if (clave !== CLAVE_SUBIR) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.render('subir', { error: 'Clave incorrecta.', ok: false });
  }

  if (!req.file) {
    return res.render('subir', { error: 'Elegí una imagen (jpg, png o webp).', ok: false });
  }

  const trabajos = leerTrabajos();
  trabajos.push({
    id: Date.now(),
    titulo: titulo || 'Trabajo realizado',
    descripcion: descripcion || '',
    imagen: `/img/trabajos/${req.file.filename}`
  });
  guardarTrabajos(trabajos);

  res.render('subir', { error: null, ok: true });
});

app.post('/trabajos/:id/eliminar', (req, res) => {
  const { clave } = req.body;
  if (clave !== CLAVE_SUBIR) {
    return res.status(403).send('Clave incorrecta');
  }

  const trabajos = leerTrabajos();
  const trabajo = trabajos.find(t => String(t.id) === req.params.id);
  if (trabajo) {
    const rutaImg = path.join(__dirname, 'public', trabajo.imagen);
    if (fs.existsSync(rutaImg)) fs.unlinkSync(rutaImg);
  }
  guardarTrabajos(trabajos.filter(t => String(t.id) !== req.params.id));

  res.redirect('/#trabajos');
});

app.listen(PORT, () => {
  console.log(`CEO Tecnología corriendo en http://localhost:${PORT}`);
});
