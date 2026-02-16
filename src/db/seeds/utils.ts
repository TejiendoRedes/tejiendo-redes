
export const VENEZUELAN_STATES = [
    {
        estado: 'Lara',
        municipios: [
            { nombre: 'Iribarren', parroquias: ['Catedral', 'Concepción', 'El Cují', 'Juan de Villegas', 'Santa Rosa', 'Tamaca', 'Unión', 'Aguedo Felipe Alvarado', 'Buena Vista', 'Juárez'] },
            { nombre: 'Palavecino', parroquias: ['Cabudare', 'José Gregorio Bastidas', 'Agua Viva'] },
            { nombre: 'Jiménez', parroquias: ['Tintorero', 'José Bernardo Dorante', 'Coronel Mariano Peraza'] },
            { nombre: 'Morán', parroquias: ['Bolívar', 'Anzoátegui', 'Guárico', 'Hilario Luna y Luna', 'Humocaro Bajo', 'Humocaro Alto', 'La Candelaria', 'Morán'] },
        ]
    },
    {
        estado: 'Yaracuy',
        municipios: [
            { nombre: 'San Felipe', parroquias: ['San Felipe', 'Albarico', 'San Javier'] },
            { nombre: 'Independencia', parroquias: ['Independencia'] },
            { nombre: 'Cocorote', parroquias: ['Cocorote'] },
        ]
    },
    {
        estado: 'Portuguesa',
        municipios: [
            { nombre: 'Araure', parroquias: ['Araure', 'Río Acarigua'] },
            { nombre: 'Páez', parroquias: ['Acarigua', 'Payara', 'Pimpinela', 'Ramón Peraza'] },
        ]
    }
];

export const SPECIALTIES = [
    'Medicina General',
    'Pediatría',
    'Ginecología y Obstetricia',
    'Cardiología',
    'Traumatología',
    'Oftalmología',
    'Odontología',
    'Dermatología',
    'Psicología',
    'Nutrición',
    'Medicina Interna',
    'Enfermería',
    'Farmacia',
    'Trabajo Social'
];

export const PATHOLOGIES = [
    { codigo: 'A09', nombre: 'Diarrea y gastroenteritis de presunto origen infeccioso' },
    { codigo: 'J00', nombre: 'Rinofaringitis aguda [resfriado común]' },
    { codigo: 'I10', nombre: 'Hipertensión esencial (primaria)' },
    { codigo: 'E11', nombre: 'Diabetes mellitus tipo 2' },
    { codigo: 'J20', nombre: 'Bronquitis aguda' },
    { codigo: 'J45', nombre: 'Asma' },
    { codigo: 'M545', nombre: 'Lumbago no especificado' },
    { codigo: 'K29', nombre: 'Gastritis y duodenitis' },
    { codigo: 'B35', nombre: 'Dermatofitosis' },
    { codigo: 'H10', nombre: 'Conjuntivitis' },
    { codigo: 'N390', nombre: 'Infección de vías urinarias, sitio no especificado' },
    { codigo: 'R51', nombre: 'Cefalea' },
    { codigo: 'D649', nombre: 'Anemia de tipo no especificado' },
    { codigo: 'L20', nombre: 'Dermatitis atópica' },
    { codigo: 'K02', nombre: 'Caries dental' },
    { codigo: 'Z000', nombre: 'Examen médico general' },
    { codigo: 'Z001', nombre: 'Control de salud de rutina del niño' },
    { codigo: 'R05', nombre: 'Tos' },
    { codigo: 'R50', nombre: 'Fiebre de origen desconocido' },
    { codigo: 'J03', nombre: 'Amigdalitis aguda' }
];

export const MEDICINES = [
    { nombre: 'Acetaminofén', presentacion: 'Tabletas 500mg', descripcion: 'Analgésico y antipirético' },
    { nombre: 'Acetaminofén', presentacion: 'Jarabe 120mg/5ml', descripcion: 'Analgésico y antipirético pediátrico' },
    { nombre: 'Ibuprofeno', presentacion: 'Tabletas 400mg', descripcion: 'Antiinflamatorio no esteroideo' },
    { nombre: 'Ibuprofeno', presentacion: 'Suspensión 100mg/5ml', descripcion: 'Antiinflamatorio pediátrico' },
    { nombre: 'Amoxicilina', presentacion: 'Cápsulas 500mg', descripcion: 'Antibiótico de amplio espectro' },
    { nombre: 'Amoxicilina', presentacion: 'Suspensión 250mg/5ml', descripcion: 'Antibiótico pediátrico' },
    { nombre: 'Loratadina', presentacion: 'Tabletas 10mg', descripcion: 'Antihistamínico' },
    { nombre: 'Loratadina', presentacion: 'Jarabe 5mg/5ml', descripcion: 'Antihistamínico pediátrico' },
    { nombre: 'Losartán Potásico', presentacion: 'Tabletas 50mg', descripcion: 'Antihipertensivo' },
    { nombre: 'Captopril', presentacion: 'Tabletas 25mg', descripcion: 'Antihipertensivo' },
    { nombre: 'Amlodipina', presentacion: 'Tabletas 5mg', descripcion: 'Antihipertensivo' },
    { nombre: 'Metformina', presentacion: 'Tabletas 850mg', descripcion: 'Antidiabético oral' },
    { nombre: 'Glibenclamida', presentacion: 'Tabletas 5mg', descripcion: 'Antidiabético oral' },
    { nombre: 'Omeprazol', presentacion: 'Cápsulas 20mg', descripcion: 'Inhibidor de la bomba de protones' },
    { nombre: 'Ácido Fólico', presentacion: 'Tabletas 5mg', descripcion: 'Suplemento vitamínico' },
    { nombre: 'Hierro (Ferroso)', presentacion: 'Tabletas 300mg', descripcion: 'Suplemento mineral' },
    { nombre: 'Multivitamínico', presentacion: 'Tabletas', descripcion: 'Suplemento nutricional' },
    { nombre: 'Clotrimazol', presentacion: 'Crema 1%', descripcion: 'Antimicótico tópico' },
    { nombre: 'Salbutamol', presentacion: 'Inhalador 100mcg', descripcion: 'Broncodilatador' },
    { nombre: 'Suero Oral', presentacion: 'Sobre de polvo', descripcion: 'Rehidratación oral' },
    { nombre: 'Diclofenac Sódico', presentacion: 'Tabletas 50mg', descripcion: 'Antiinflamatorio y analgésico' },
    { nombre: 'Complejo B', presentacion: 'Tabletas', descripcion: 'Vitaminas neurotrópicas' },
    { nombre: 'Desloratadina', presentacion: 'Tabletas 5mg', descripcion: 'Antihistamínico no sedante' },
    { nombre: 'Azitromicina', presentacion: 'Tabletas 500mg', descripcion: 'Antibiótico macrólido' },
    { nombre: 'Ciprofloxacina', presentacion: 'Tabletas 500mg', descripcion: 'Antibiótico Fluoroquinolona' }
];

export const NAMES = ['José', 'María', 'Juan', 'Ana', 'Luis', 'Carmen', 'Carlos', 'Rosa', 'Pedro', 'Elena', 'Jesús', 'Isabel', 'Miguel', 'Teresa', 'Antonio', 'Juana', 'Francisco', 'Francisca', 'David', 'Laura', 'Alejandro', 'Andrea', 'Manuel', 'Patricia', 'Daniel', 'Valentina', 'Rafael', 'Gabriela', 'Ángel', 'Daniela'];
export const SURNAMES = ['González', 'Rodríguez', 'Pérez', 'Hernández', 'García', 'Martínez', 'López', 'Sánchez', 'Díaz', 'Ramírez', 'Torres', 'Fernández', 'Castillo', 'Gómez', 'Rojas', 'Mendoza', 'Vargas', 'Jiménez', 'Moreno', 'Quintero', 'Flores', 'Alvarado', 'Romero', 'Silva', 'Méndez', 'Rivas', 'Salazar', 'Medina', 'Guillén', 'León'];

export const TEJEDOR_ROLES = ['Coordinador', 'Médico', 'Enfermero/a', 'Logística', 'Farmacia', 'Registro', 'Apoyo General'];

// Helper Functions

export function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateCedula(): string {
    const prefix = Math.random() > 0.95 ? 'E-' : 'V-';
    const number = Math.floor(Math.random() * (30000000 - 4000000 + 1)) + 4000000;
    return `${prefix}${number}`;
}

export function generatePhoneNumber(): string {
    const prefixes = ['0412', '0414', '0424', '0416', '0426'];
    const prefix = getRandomElement(prefixes);
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `${prefix}${number}`;
}

export function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generateEmail(name: string, surname: string): string {
    const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.es'];
    const cleanName = name.toLowerCase().replace(/ñ/g, 'n').replace(/\s/g, '');
    const cleanSurname = surname.toLowerCase().replace(/ñ/g, 'n').replace(/\s/g, '');
    const randomNum = Math.floor(Math.random() * 100);
    return `${cleanName}.${cleanSurname}${randomNum}@${getRandomElement(domains)}`;
}
