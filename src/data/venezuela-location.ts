/**
 * Datos de ubicación de Venezuela - Estados, Municipios y Parroquias
 * Implementación para 16 estados principales
 */

export interface Municipio {
  id: string;
  nombre: string;
  parroquias: Parroquia[];
}

export interface Parroquia {
  id: string;
  nombre: string;
}

export interface Estado {
  id: string;
  nombre: string;
  municipios: Municipio[];
}

export const VENEZUELA_DATA: Estado[] = [
  {
    id: 'DC',
    nombre: 'Distrito Capital',
    municipios: [
      {
        id: '01',
        nombre: 'Libertador',
        parroquias: [
          { id: '01', nombre: 'Altagracia' },
          { id: '02', nombre: 'Antímano' },
          { id: '03', nombre: 'Caricuao' },
          { id: '04', nombre: 'Catedral' },
          { id: '05', nombre: 'Caucaguita' },
          { id: '06', nombre: 'El Recreo' },
          { id: '07', nombre: 'El Valle' },
          { id: '08', nombre: 'La Pastora' },
          { id: '09', nombre: 'Los Ruices' },
          { id: '10', nombre: 'Macarao' },
          { id: '11', nombre: 'San Agustín' },
          { id: '12', nombre: 'San Bernardino' },
          { id: '13', nombre: 'San José' },
          { id: '14', nombre: 'San Juan' },
          { id: '15', nombre: 'Santa Rosalía' },
          { id: '16', nombre: 'Santa Teresa' },
          { id: '17', nombre: 'Sucre' },
          { id: '18', nombre: '23 de Enero' },
          { id: '19', nombre: 'Palo Verde' },
          { id: '20', nombre: 'Pedro Gual' },
          { id: '21', nombre: 'Macaracuay' },
          { id: '22', nombre: 'El Junquito' }
        ]
      }
    ]
  },
  {
    id: 'AN',
    nombre: 'Anzoátegui',
    municipios: [
      {
        id: '01',
        nombre: 'Anaco',
        parroquias: [
          { id: '01', nombre: 'Anaco' },
          { id: '02', nombre: 'El Carito' }
        ]
      },
      {
        id: '02',
        nombre: 'Aragua',
        parroquias: [
          { id: '01', nombre: 'Aragua de Barcelona' },
          { id: '02', nombre: 'Cachipo' },
          { id: '03', nombre: 'El Pilar' },
          { id: '04', nombre: 'Güiripa' }
        ]
      },
      {
        id: '03',
        nombre: 'Barcelona',
        parroquias: [
          { id: '01', nombre: 'Barcelona' },
          { id: '02', nombre: 'Cerro Negro' },
          { id: '03', nombre: 'El Morro' },
          { id: '04', nombre: 'Naricual' },
          { id: '05', nombre: 'San Cristóbal' }
        ]
      },
      {
        id: '04',
        nombre: 'Bolívar',
        parroquias: [
          { id: '01', nombre: 'Bolívar' },
          { id: '02', nombre: 'Cruz Verde' },
          { id: '03', nombre: 'Múcura' }
        ]
      },
      {
        id: '05',
        nombre: 'Cantaura',
        parroquias: [
          { id: '01', nombre: 'Altagracia de Orituco' },
          { id: '02', nombre: 'Cantaura' },
          { id: '03', nombre: 'Santa Rosa' },
          { id: '04', nombre: 'Tomas Echenagucia' }
        ]
      },
      {
        id: '06',
        nombre: 'Diego Bautista Urbaneja',
        parroquias: [
          { id: '01', nombre: 'Diego Bautista Urbaneja' },
          { id: '02', nombre: 'Bergantín' },
          { id: '03', nombre: 'El Pilar' },
          { id: '04', nombre: 'Guaribe' }
        ]
      },
      {
        id: '07',
        nombre: 'Fernando de Peñalver',
        parroquias: [
          { id: '01', nombre: 'Atapirire' },
          { id: '02', nombre: 'Boca de Pao' },
          { id: '03', nombre: 'El Pao' },
          { id: '04', nombre: 'Peñalver' }
        ]
      },
      {
        id: '08',
        nombre: 'Guanta',
        parroquias: [
          { id: '01', nombre: 'Guanta' },
          { id: '02', nombre: 'Merecure' }
        ]
      },
      {
        id: '09',
        nombre: 'Independencia',
        parroquias: [
          { id: '01', nombre: 'Mamo' },
          { id: '02', nombre: 'Soledad' }
        ]
      },
      {
        id: '10',
        nombre: 'José Gregorio Monagas',
        parroquias: [
          { id: '01', nombre: 'Chaguaramas' },
          { id: '02', nombre: 'Mapire' }
        ]
      },
      {
        id: '11',
        nombre: 'Libertad',
        parroquias: [
          { id: '01', nombre: 'Libertad' },
          { id: '02', nombre: 'San Mateo' }
        ]
      },
      {
        id: '12',
        nombre: 'Manuel Ezequiel Bruzual',
        parroquias: [
          { id: '01', nombre: 'Clarines' },
          { id: '02', nombre: 'Guana' },
          { id: '03', nombre: 'Píritu' }
        ]
      },
      {
        id: '13',
        nombre: 'Pedro María Freites',
        parroquias: [
          { id: '01', nombre: 'Pedro María Freites' },
          { id: '02', nombre: 'Urica' }
        ]
      },
      {
        id: '14',
        nombre: 'Píritu',
        parroquias: [
          { id: '01', nombre: 'Píritu' },
          { id: '02', nombre: 'Río Chico' },
          { id: '03', nombre: 'San Francisco' }
        ]
      },
      {
        id: '15',
        nombre: 'San José de Guanipa',
        parroquias: [
          { id: '01', nombre: 'San José de Guanipa' },
          { id: '02', nombre: 'Uverito' }
        ]
      },
      {
        id: '16',
        nombre: 'Simón Rodríguez',
        parroquias: [
          { id: '01', nombre: 'El Pao' },
          { id: '02', nombre: 'Simón Rodríguez' }
        ]
      },
      {
        id: '17',
        nombre: 'Sir Arthur McGregor',
        parroquias: [
          { id: '01', nombre: 'El Amparo' },
          { id: '02', nombre: 'Múcuru' },
          { id: '03', nombre: 'Santa Bárbara' },
          { id: '04', nombre: 'Sir Arthur McGregor' }
        ]
      },
      {
        id: '18',
        nombre: 'Sotillo',
        parroquias: [
          { id: '01', nombre: 'Puerto Píritu' },
          { id: '02', nombre: 'Sotillo' }
        ]
      }
    ]
  },
  {
    id: 'BA',
    nombre: 'Barinas',
    municipios: [
      {
        id: '01',
        nombre: 'Alberto Arvelo Torrealba',
        parroquias: [
          { id: '01', nombre: 'Alberto Arvelo Torrealba' }
        ]
      },
      {
        id: '02',
        nombre: 'Barinas',
        parroquias: [
          { id: '01', nombre: 'Alfredo Salaver' },
          { id: '02', nombre: 'Barinas' },
          { id: '03', nombre: 'Dolores' },
          { id: '04', nombre: 'El Carmen' },
          { id: '05', nombre: 'Joaquín' },
          { id: '06', nombre: 'La Barinesa' },
          { id: '07', nombre: 'Ramón Ignacio Méndez' },
          { id: '08', nombre: 'Rómulo Gallegos' },
          { id: '09', nombre: 'San Silvestre' },
          { id: '10', nombre: 'Santa Inés' },
          { id: '11', nombre: 'Sabaneta' },
          { id: '12', nombre: 'Torunos' }
        ]
      },
      {
        id: '03',
        nombre: 'Bolívar',
        parroquias: [
          { id: '01', nombre: 'Bolívar' },
          { id: '02', nombre: 'Altamira' },
          { id: '03', nombre: 'Barinitas' },
          { id: '04', nombre: 'Calderas' }
        ]
      },
      {
        id: '04',
        nombre: 'Cruz Paredes',
        parroquias: [
          { id: '01', nombre: 'Barrancas' },
          { id: '02', nombre: 'Cruz Paredes' },
          { id: '03', nombre: 'Mazparrito' }
        ]
      },
      {
        id: '05',
        nombre: 'Ezequiel Zamora',
        parroquias: [
          { id: '01', nombre: 'Ezequiel Zamora' },
          { id: '02', nombre: 'Punta de Piedras' }
        ]
      },
      {
        id: '06',
        nombre: 'Obispos',
        parroquias: [
          { id: '01', nombre: 'Guadarrama' },
          { id: '02', nombre: 'Obispos' }
        ]
      },
      {
        id: '07',
        nombre: 'Pedraza',
        parroquias: [
          { id: '01', nombre: 'Ciudad Bolivia' },
          { id: '02', nombre: 'Pedraza' }
        ]
      },
      {
        id: '08',
        nombre: 'Rojas',
        parroquias: [
          { id: '01', nombre: 'Dolores' },
          { id: '02', nombre: 'Loma de Hierro' },
          { id: '03', nombre: 'Rojas' },
          { id: '04', nombre: 'Santa Rosa' }
        ]
      },
      {
        id: '09',
        nombre: 'Sosa',
        parroquias: [
          { id: '01', nombre: 'Ciudad de Nutrias' },
          { id: '02', nombre: 'Sosa' }
        ]
      }
    ]
  },
  {
    id: 'CA',
    nombre: 'Carabobo',
    municipios: [
      {
        id: '01',
        nombre: 'Bejuma',
        parroquias: [
          { id: '01', nombre: 'Bejuma' }
        ]
      },
      {
        id: '02',
        nombre: 'Carlos Arvelo',
        parroquias: [
          { id: '01', nombre: 'Guigüe' },
          { id: '02', nombre: 'La Yuca' },
          { id: '03', nombre: 'Tacarigua' }
        ]
      },
      {
        id: '03',
        nombre: 'Diego Ibarra',
        parroquias: [
          { id: '01', nombre: 'Aguas Calientes' },
          { id: '02', nombre: 'Burbusay' },
          { id: '03', nombre: 'Diego Ibarra' },
          { id: '04', nombre: 'Marín' }
        ]
      },
      {
        id: '04',
        nombre: 'Guacara',
        parroquias: [
          { id: '01', nombre: 'Guacara' }
        ]
      },
      {
        id: '05',
        nombre: 'Juan José Mora',
        parroquias: [
          { id: '01', nombre: 'Juan José Mora' }
        ]
      },
      {
        id: '06',
        nombre: 'Libertador',
        parroquias: [
          { id: '01', nombre: 'Tocuyito' }
        ]
      },
      {
        id: '07',
        nombre: 'Los Guayos',
        parroquias: [
          { id: '01', nombre: 'Los Guayos' }
        ]
      },
      {
        id: '08',
        nombre: 'Montalbán',
        parroquias: [
          { id: '01', nombre: 'Montalbán' }
        ]
      },
      {
        id: '09',
        nombre: 'Naguanagua',
        parroquias: [
          { id: '01', nombre: 'Naguanagua' },
          { id: '02', nombre: 'Boca de Uchire' }
        ]
      },
      {
        id: '10',
        nombre: 'Puerto Cabello',
        parroquias: [
          { id: '01', nombre: 'Bartolomé de las Casas' },
          { id: '02', nombre: 'Boca de Aroa' },
          { id: '03', nombre: 'Demetrio Vega' },
          { id: '04', nombre: 'Johan Herrera' },
          { id: '05', nombre: 'Morón' },
          { id: '06', nombre: 'Patrimonio' },
          { id: '07', nombre: 'Puerto Cabello' }
        ]
      },
      {
        id: '11',
        nombre: 'San Joaquín',
        parroquias: [
          { id: '01', nombre: 'San Joaquín' }
        ]
      },
      {
        id: '12',
        nombre: 'Tocuyito',
        parroquias: [
          { id: '01', nombre: 'Concepción' },
          { id: '02', nombre: 'Lecherías' },
          { id: '03', nombre: 'Santa Cruz' },
          { id: '04', nombre: 'Tocuyito' }
        ]
      },
      {
        id: '13',
        nombre: 'Valencia',
        parroquias: [
          { id: '01', nombre: 'Catedral' },
          { id: '02', nombre: 'Catedral' },
          { id: '03', nombre: 'El Socorro' },
          { id: '04', nombre: 'La Viña' },
          { id: '05', nombre: 'Miguel Peña' },
          { id: '06', nombre: 'Negros Primero' },
          { id: '07', nombre: 'Negros Segundo' },
          { id: '08', nombre: 'Rafael Urdaneta' },
          { id: '09', nombre: 'San Blas' },
          { id: '10', nombre: 'San José' },
          { id: '11', nombre: 'Santa Rosa' },
          { id: '12', nombre: 'Valencia' }
        ]
      }
    ]
  },
  {
    id: 'CO',
    nombre: 'Cojedes',
    municipios: [
      {
        id: '01',
        nombre: 'Anzoátegui',
        parroquias: [
          { id: '01', nombre: 'Cojedes' },
          { id: '02', nombre: 'Mapurite' }
        ]
      },
      {
        id: '02',
        nombre: 'Falcón',
        parroquias: [
          { id: '01', nombre: 'Tinaquillo' }
        ]
      },
      {
        id: '03',
        nombre: 'Girardot',
        parroquias: [
          { id: '01', nombre: 'Girardot' }
        ]
      },
      {
        id: '04',
        nombre: 'Lima Blanco',
        parroquias: [
          { id: '01', nombre: 'El Baúl' },
          { id: '02', nombre: 'La Aguadita' },
          { id: '03', nombre: 'Lima Blanco' },
          { id: '04', nombre: 'Macapo' },
          { id: '05', nombre: 'Río Turbio' }
        ]
      },
      {
        id: '05',
        nombre: 'Pao',
        parroquias: [
          { id: '01', nombre: 'Pao' }
        ]
      },
      {
        id: '06',
        nombre: 'Ricaurte',
        parroquias: [
          { id: '01', nombre: 'Ricaurte' }
        ]
      },
      {
        id: '07',
        nombre: 'Rómulo Gallegos',
        parroquias: [
          { id: '01', nombre: 'Rómulo Gallegos' }
        ]
      },
      {
        id: '08',
        nombre: 'San Carlos',
        parroquias: [
          { id: '01', nombre: 'San Carlos' }
        ]
      },
      {
        id: '09',
        nombre: 'Tinaquillo',
        parroquias: [
          { id: '01', nombre: 'Tinaquillo' }
        ]
      }
    ]
  },
  {
    id: 'DA',
    nombre: 'Delta Amacuro',
    municipios: [
      {
        id: '01',
        nombre: 'Antonio Díaz',
        parroquias: [
          { id: '01', nombre: 'Antonio Díaz' },
          { id: '02', nombre: 'Curiapo' },
          { id: '03', nombre: 'Manoa' },
          { id: '04', nombre: 'Múcuru' }
        ]
      },
      {
        id: '02',
        nombre: 'Casacoima',
        parroquias: [
          { id: '01', nombre: 'Casacoima' }
        ]
      },
      {
        id: '03',
        nombre: 'Pedernales',
        parroquias: [
          { id: '01', nombre: 'Pedernales' }
        ]
      },
      {
        id: '04',
        nombre: 'Tucupita',
        parroquias: [
          { id: '01', nombre: 'El Triunfo' },
          { id: '02', nombre: 'Imataca' },
          { id: '03', nombre: 'Mánires' },
          { id: '04', nombre: 'San José de Buja' },
          { id: '05', nombre: 'Venero' }
        ]
      }
    ]
  },
  {
    id: 'FA',
    nombre: 'Falcón',
    municipios: [
      {
        id: '01',
        nombre: 'Acosta',
        parroquias: [
          { id: '01', nombre: 'Acosta' }
        ]
      },
      {
        id: '02',
        nombre: 'Bolívar',
        parroquias: [
          { id: '01', nombre: 'Aroa' },
          { id: '02', nombre: 'Bolívar' },
          { id: '03', nombre: 'Cruz Verde' },
          { id: '04', nombre: 'Judibana' }
        ]
      },
      {
        id: '03',
        nombre: 'Buchivacoa',
        parroquias: [
          { id: '01', nombre: 'Buchivacoa' }
        ]
      },
      {
        id: '04',
        nombre: 'Cacique Manaure',
        parroquias: [
          { id: '01', nombre: 'Cacique Manaure' }
        ]
      },
      {
        id: '05',
        nombre: 'Carirubana',
        parroquias: [
          { id: '01', nombre: 'Carirubana' }
        ]
      },
      {
        id: '06',
        nombre: 'Colina',
        parroquias: [
          { id: '01', nombre: 'Colina' }
        ]
      },
      {
        id: '07',
        nombre: 'Dabajuro',
        parroquias: [
          { id: '01', nombre: 'Dabajuro' }
        ]
      },
      {
        id: '08',
        nombre: 'Democracia',
        parroquias: [
          { id: '01', nombre: 'Democracia' }
        ]
      },
      {
        id: '09',
        nombre: 'Falcón',
        parroquias: [
          { id: '01', nombre: 'Falcón' }
        ]
      },
      {
        id: '10',
        nombre: 'Federal',
        parroquias: [
          { id: '01', nombre: 'Federal' }
        ]
      },
      {
        id: '11',
        nombre: 'Jacura',
        parroquias: [
          { id: '01', nombre: 'Jacura' }
        ]
      },
      {
        id: '12',
        nombre: 'Los Taques',
        parroquias: [
          { id: '01', nombre: 'Los Taques' }
        ]
      },
      {
        id: '13',
        nombre: 'Mauroa',
        parroquias: [
          { id: '01', nombre: 'Mauroa' }
        ]
      },
      {
        id: '14',
        nombre: 'Mene de Mauroa',
        parroquias: [
          { id: '01', nombre: 'Mene de Mauroa' }
        ]
      },
      {
        id: '15',
        nombre: 'Miranda',
        parroquias: [
          { id: '01', nombre: 'Miranda' },
          { id: '02', nombre: 'San Luis' },
          { id: '03', nombre: 'Santa Ana' }
        ]
      },
      {
        id: '16',
        nombre: 'Monte Carmelo',
        parroquias: [
          { id: '01', nombre: 'Monte Carmelo' }
        ]
      },
      {
        id: '17',
        nombre: 'Palma Sola',
        parroquias: [
          { id: '01', nombre: 'Palma Sola' }
        ]
      },
      {
        id: '18',
        nombre: 'Petit',
        parroquias: [
          { id: '01', nombre: 'Petit' }
        ]
      },
      {
        id: '19',
        nombre: 'Píritu',
        parroquias: [
          { id: '01', nombre: 'Píritu' }
        ]
      },
      {
        id: '20',
        nombre: 'San Francisco',
        parroquias: [
          { id: '01', nombre: 'San Francisco' },
          { id: '02', nombre: 'Macupías' }
        ]
      },
      {
        id: '21',
        nombre: 'Silva',
        parroquias: [
          { id: '01', nombre: 'Silva' }
        ]
      },
      {
        id: '22',
        nombre: 'Sucre',
        parroquias: [
          { id: '01', nombre: 'Sucre' },
          { id: '02', nombre: 'Urumaco' }
        ]
      },
      {
        id: '23',
        nombre: 'Tocópero',
        parroquias: [
          { id: '01', nombre: 'Tocópero' }
        ]
      },
      {
        id: '24',
        nombre: 'Unión',
        parroquias: [
          { id: '01', nombre: 'Unión' }
        ]
      },
      {
        id: '25',
        nombre: 'Urumaco',
        parroquias: [
          { id: '01', nombre: 'Urumaco' }
        ]
      }
    ]
  },
  {
    id: 'GU',
    nombre: 'Guárico',
    municipios: [
      {
        id: '01',
        nombre: 'Camaguán',
        parroquias: [
          { id: '01', nombre: 'Camaguán' }
        ]
      },
      {
        id: '02',
        nombre: 'Carrizal',
        parroquias: [
          { id: '01', nombre: 'Carrizal' }
        ]
      },
      {
        id: '03',
        nombre: 'Chaguaramas',
        parroquias: [
          { id: '01', nombre: 'Chaguaramas' }
        ]
      },
      {
        id: '04',
        nombre: 'El Socorro',
        parroquias: [
          { id: '01', nombre: 'El Socorro' }
        ]
      },
      {
        id: '05',
        nombre: 'Infante',
        parroquias: [
          { id: '01', nombre: 'Infante' }
        ]
      },
      {
        id: '06',
        nombre: 'Las Mercedes',
        parroquias: [
          { id: '01', nombre: 'Las Mercedes' }
        ]
      },
      {
        id: '07',
        nombre: 'Mellado',
        parroquias: [
          { id: '01', nombre: 'Mellado' }
        ]
      },
      {
        id: '08',
        nombre: 'Miranda',
        parroquias: [
          { id: '01', nombre: 'Miranda' }
        ]
      },
      {
        id: '09',
        nombre: 'Monagas',
        parroquias: [
          { id: '01', nombre: 'Monagas' }
        ]
      },
      {
        id: '10',
        nombre: 'Ortiz',
        parroquias: [
          { id: '01', nombre: 'Ortiz' }
        ]
      },
      {
        id: '11',
        nombre: 'Ospino',
        parroquias: [
          { id: '01', nombre: 'Ospino' }
        ]
      },
      {
        id: '12',
        nombre: 'Paz Castillo',
        parroquias: [
          { id: '01', nombre: 'Paz Castillo' }
        ]
      },
      {
        id: '13',
        nombre: 'San José de Guaribe',
        parroquias: [
          { id: '01', nombre: 'San José de Guaribe' }
        ]
      },
      {
        id: '14',
        nombre: 'San Juan de los Morros',
        parroquias: [
          { id: '01', nombre: 'San Juan de los Morros' }
        ]
      },
      {
        id: '15',
        nombre: 'Valle de la Pascua',
        parroquias: [
          { id: '01', nombre: 'Valle de la Pascua' }
        ]
      }
    ]
  },
  {
    id: 'LA',
    nombre: 'Lara',
    municipios: [
      {
        id: '01',
        nombre: 'Andrés Eloy Blanco',
        parroquias: [
          { id: '01', nombre: 'Barquisimeto' },
          { id: '02', nombre: 'La Miel' },
          { id: '03', nombre: 'Río Tocuyo' },
          { id: '04', nombre: 'Santa Cruz' },
          { id: '05', nombre: 'El Cují' },
          { id: '06', nombre: 'Moroturo' }
        ]
      },
      {
        id: '02',
        nombre: 'Crespo',
        parroquias: [
          { id: '01', nombre: 'Crespo' }
        ]
      },
      {
        id: '03',
        nombre: 'Iribarren',
        parroquias: [
          { id: '01', nombre: 'Iribarren' }
        ]
      },
      {
        id: '04',
        nombre: 'Jiménez',
        parroquias: [
          { id: '01', nombre: 'Jiménez' },
          { id: '02', nombre: 'Cuara' },
          { id: '03', nombre: 'El Tocuyo' },
          { id: '04', nombre: 'Dulce Nombre' }
        ]
      },
      {
        id: '05',
        nombre: 'Morán',
        parroquias: [
          { id: '01', nombre: 'Morán' }
        ]
      },
      {
        id: '06',
        nombre: 'Palavecino',
        parroquias: [
          { id: '01', nombre: 'Palavecino' }
        ]
      },
      {
        id: '07',
        nombre: 'Simón Planas',
        parroquias: [
          { id: '01', nombre: 'Simón Planas' }
        ]
      },
      {
        id: '08',
        nombre: 'Torres',
        parroquias: [
          { id: '01', nombre: 'Torres' }
        ]
      },
      {
        id: '09',
        nombre: 'Urdaneta',
        parroquias: [
          { id: '01', nombre: 'Urdaneta' }
        ]
      }
    ]
  },
  {
    id: 'ME',
    nombre: 'Mérida',
    municipios: [
      {
        id: '01',
        nombre: 'Mérida',
        parroquias: [
          { id: '01', nombre: 'Mérida' },
          { id: '02', nombre: 'Santiago' },
          { id: '03', nombre: 'Laja' },
          { id: '04', nombre: 'Jají' },
          { id: '05', nombre: 'San Juan' },
          { id: '06', nombre: 'El Morro' },
          { id: '07', nombre: 'Los Nevados' },
          { id: '08', nombre: 'Ejido' }
        ]
      },
      {
        id: '02',
        nombre: 'Santos Marquina',
        parroquias: [
          { id: '01', nombre: 'Santos Marquina' },
          { id: '02', nombre: 'Tabay' }
        ]
      },
      {
        id: '03',
        nombre: 'Sucre',
        parroquias: [
          { id: '01', nombre: 'Lagunillas' },
          { id: '02', nombre: 'Chiguará' },
          { id: '03', nombre: 'Estanques' },
          { id: '04', nombre: 'Pueblo Nuevo' }
        ]
      },
      {
        id: '04',
        nombre: 'Tovar',
        parroquias: [
          { id: '01', nombre: 'Tovar' },
          { id: '02', nombre: 'El Amparo' }
        ]
      }
    ]
  },
  {
    id: 'MO',
    nombre: 'Monagas',
    municipios: [
      {
        id: '01',
        nombre: 'Maturín',
        parroquias: [
          { id: '01', nombre: 'Maturín' },
          { id: '02', nombre: 'Las Cocuizas' },
          { id: '03', nombre: 'San Simón' },
          { id: '04', nombre: 'Alto de los Godos' },
          { id: '05', nombre: 'Boquerón' },
          { id: '06', nombre: 'La Pica' },
          { id: '07', nombre: 'El Corozo' },
          { id: '08', nombre: 'Jusepín' }
        ]
      },
      {
        id: '02',
        nombre: 'Acarigua',
        parroquias: [
          { id: '01', nombre: 'Acarigua' },
          { id: '02', nombre: 'Aragüita' }
        ]
      },
      {
        id: '03',
        nombre: 'Caripe',
        parroquias: [
          { id: '01', nombre: 'Caripe' },
          { id: '02', nombre: 'Sabana de Piedra' }
        ]
      }
    ]
  },
  {
    id: 'NE',
    nombre: 'Nueva Esparta',
    municipios: [
      {
        id: '01',
        nombre: 'La Asunción',
        parroquias: [
          { id: '01', nombre: 'La Asunción' },
          { id: '02', nombre: 'Santa Ana' },
          { id: '03', nombre: 'Valle de Espíritu Santo' }
        ]
      },
      {
        id: '02',
        nombre: 'Díaz',
        parroquias: [
          { id: '01', nombre: 'San Francisco de Macanao' },
          { id: '02', nombre: 'Boca del Río' }
        ]
      },
      {
        id: '03',
        nombre: 'Gómez',
        parroquias: [
          { id: '01', nombre: 'Santa Ana' },
          { id: '02', nombre: 'Valle de Espíritu Santo' }
        ]
      },
      {
        id: '04',
        nombre: 'Maneiro',
        parroquias: [
          { id: '01', nombre: 'Juan Griego' },
          { id: '02', nombre: 'San Pedro' }
        ]
      },
      {
        id: '05',
        nombre: 'Mariño',
        parroquias: [
          { id: '01', nombre: 'Pampatar' },
          { id: '02', nombre: 'Concepción' }
        ]
      },
      {
        id: '06',
        nombre: 'Península de Macanao',
        parroquias: [
          { id: '01', nombre: 'Macanao' },
          { id: '02', nombre: 'San Francisco' }
        ]
      },
      {
        id: '07',
        nombre: 'Tubores',
        parroquias: [
          { id: '01', nombre: 'Los Barales' },
          { id: '02', nombre: 'La Guardia' }
        ]
      },
      {
        id: '08',
        nombre: 'Villalba',
        parroquias: [
          { id: '01', nombre: 'San Pedro' },
          { id: '02', nombre: 'Santa Fe' }
        ]
      },
      {
        id: '09',
        nombre: 'Arismendi',
        parroquias: [
          { id: '01', nombre: 'La Asunción' },
          { id: '02', nombre: 'Santa Ana' }
        ]
      },
      {
        id: '10',
        nombre: 'García',
        parroquias: [
          { id: '01', nombre: 'Juan Griego' },
          { id: '02', nombre: 'San Pedro' }
        ]
      },
      {
        id: '11',
        nombre: 'Antolín del Campo',
        parroquias: [
          { id: '01', nombre: 'Boca del Río' },
          { id: '02', nombre: 'San Francisco' }
        ]
      }
    ]
  },
  {
    id: 'PO',
    nombre: 'Portuguesa',
    municipios: [
      {
        id: '01',
        nombre: 'Guanare',
        parroquias: [
          { id: '01', nombre: 'Guanare' },
          { id: '02', nombre: 'San José de la Montaña' },
          { id: '03', nombre: 'Córdoba' },
          { id: '04', nombre: 'San Juan de Guanaguanare' }
        ]
      },
      {
        id: '02',
        nombre: 'Araure',
        parroquias: [
          { id: '01', nombre: 'Araure' },
          { id: '02', nombre: 'Urbana San Miguel' }
        ]
      },
      {
        id: '03',
        nombre: 'Acosta',
        parroquias: [
          { id: '01', nombre: 'Píritu' },
          { id: '02', nombre: 'San Antonio' }
        ]
      },
      {
        id: '04',
        nombre: 'Agua Blanca',
        parroquias: [
          { id: '01', nombre: 'Agua Blanca' },
          { id: '02', nombre: 'El Mamón' }
        ]
      },
      {
        id: '05',
        nombre: 'Ospino',
        parroquias: [
          { id: '01', nombre: 'Ospino' },
          { id: '02', nombre: 'La Aparición' }
        ]
      }
    ]
  },
  {
    id: 'SU',
    nombre: 'Sucre',
    municipios: [
      {
        id: '01',
        nombre: 'Cumaná',
        parroquias: [
          { id: '01', nombre: 'Cumaná' },
          { id: '02', nombre: 'Valentín Valiente' },
          { id: '03', nombre: 'San Antonio' },
          { id: '04', nombre: 'Santa Inés' },
          { id: '05', nombre: 'Santa María' }
        ]
      },
      {
        id: '02',
        nombre: 'Cumanacoa',
        parroquias: [
          { id: '01', nombre: 'Cumanacoa' },
          { id: '02', nombre: 'Aripao' },
          { id: '03', nombre: 'Mariguitar' }
        ]
      },
      {
        id: '03',
        nombre: 'Carúpano',
        parroquias: [
          { id: '01', nombre: 'Carúpano' },
          { id: '02', nombre: 'Santa Cruz' },
          { id: '03', nombre: 'Cruz Salmerón' }
        ]
      },
      {
        id: '04',
        nombre: 'Maturín',
        parroquias: [
          { id: '01', nombre: 'Maturín' },
          { id: '02', nombre: 'San Félix' }
        ]
      }
    ]
  },
  {
    id: 'TA',
    nombre: 'Táchira',
    municipios: [
      {
        id: '01',
        nombre: 'San Cristóbal',
        parroquias: [
          { id: '01', nombre: 'San Cristóbal' },
          { id: '02', nombre: 'San Juan Bautista' },
          { id: '03', nombre: 'Pedro María Morantes' },
          { id: '04', nombre: 'Rómulo Betancourt' },
          { id: '05', nombre: 'Dr. Francisco Romero Lobo' }
        ]
      },
      {
        id: '02',
        nombre: 'San Antonio del Táchira',
        parroquias: [
          { id: '01', nombre: 'San Antonio del Táchira' },
          { id: '02', nombre: 'Boca del Monte' }
        ]
      },
      {
        id: '03',
        nombre: 'Rubio',
        parroquias: [
          { id: '01', nombre: 'Rubio' },
          { id: '02', nombre: 'El Cobre' }
        ]
      },
      {
        id: '04',
        nombre: 'Capacho',
        parroquias: [
          { id: '01', nombre: 'Capacho Nuevo' },
          { id: '02', nombre: 'Capacho Viejo' }
        ]
      },
      {
        id: '05',
        nombre: 'Táriba',
        parroquias: [
          { id: '01', nombre: 'Táriba' },
          { id: '02', nombre: 'Junín' }
        ]
      }
    ]
  },
  {
    id: 'TR',
    nombre: 'Trujillo',
    municipios: [
      {
        id: '01',
        nombre: 'Trujillo',
        parroquias: [
          { id: '01', nombre: 'Trujillo' },
          { id: '02', nombre: 'Andrés Bello' },
          { id: '03', nombre: 'Cruz Carrillo' },
          { id: '04', nombre: 'La Paz' },
          { id: '05', nombre: 'San Juan' }
        ]
      },
      {
        id: '02',
        nombre: 'Valera',
        parroquias: [
          { id: '01', nombre: 'Valera' },
          { id: '02', nombre: 'Carvajal' },
          { id: '03', nombre: 'La Puerta' },
          { id: '04', nombre: 'Mendoza' }
        ]
      },
      {
        id: '03',
        nombre: 'Boconó',
        parroquias: [
          { id: '01', nombre: 'Boconó' },
          { id: '02', nombre: 'El Carmen' },
          { id: '03', nombre: 'Guaimaral' }
        ]
      },
      {
        id: '04',
        nombre: 'Carache',
        parroquias: [
          { id: '01', nombre: 'Carache' },
          { id: '02', nombre: 'La Concepción' }
        ]
      }
    ]
  },
  {
    id: 'YA',
    nombre: 'Yaracuy',
    municipios: [
      {
        id: '01',
        nombre: 'San Felipe',
        parroquias: [
          { id: '01', nombre: 'San Felipe' },
          { id: '02', nombre: 'Albarico' },
          { id: '03', nombre: 'Guama' },
          { id: '04', nombre: 'Javier' }
        ]
      },
      {
        id: '02',
        nombre: 'Yaritagua',
        parroquias: [
          { id: '01', nombre: 'Yaritagua' },
          { id: '02', nombre: 'Temerla' }
        ]
      },
      {
        id: '03',
        nombre: 'Chivacoa',
        parroquias: [
          { id: '01', nombre: 'Chivacoa' },
          { id: '02', nombre: 'Aroa' }
        ]
      },
      {
        id: '04',
        nombre: 'Cocorote',
        parroquias: [
          { id: '01', nombre: 'Cocorote' },
          { id: '02', nombre: 'Santa Bárbara' }
        ]
      },
      {
        id: '05',
        nombre: 'Nirgua',
        parroquias: [
          { id: '01', nombre: 'Nirgua' },
          { id: '02', nombre: 'Temerla' }
        ]
      }
    ]
  },
  {
    id: 'ZU',
    nombre: 'Zulia',
    municipios: [
      {
        id: '01',
        nombre: 'Maracaibo',
        parroquias: [
          { id: '01', nombre: 'Maracaibo' },
          { id: '02', nombre: 'Coquivacoa' },
          { id: '03', nombre: 'Cruz Verde' },
          { id: '04', nombre: 'Francisco Eugenio Bustamante' },
          { id: '05', nombre: 'Idelfonso Vásquez' },
          { id: '06', nombre: 'Juana de Ávila' },
          { id: '07', nombre: 'La Concepción' },
          { id: '08', nombre: 'Luis Hurtado Higuera' },
          { id: '09', nombre: 'Manuel Dagnare' },
          { id: '10', nombre: 'Olegario Villalobos' },
          { id: '11', nombre: 'Punta de Piedra' },
          { id: '12', nombre: 'San Isidro' },
          { id: '13', nombre: 'Santa Lucía' },
          { id: '14', nombre: 'Simón Bolívar' },
          { id: '15', nombre: 'Venancio Casares' },
          { id: '16', nombre: 'Cacique Mara' },
          { id: '17', nombre: 'Cecilio Acosta' },
          { id: '18', nombre: 'Chiquinquirá' }
        ]
      },
      {
        id: '02',
        nombre: 'San Francisco',
        parroquias: [
          { id: '01', nombre: 'San Francisco' },
          { id: '02', nombre: 'El Bajo' },
          { id: '03', nombre: 'El Carmen' },
          { id: '04', nombre: 'El Mene' },
          { id: '05', nombre: 'Francisco Ochoa' },
          { id: '06', nombre: 'La Concepción' },
          { id: '07', nombre: 'Los Cortijos' },
          { id: '08', nombre: 'Maracaibo' }
        ]
      },
      {
        id: '03',
        nombre: 'Cabimas',
        parroquias: [
          { id: '01', nombre: 'Cabimas' },
          { id: '02', nombre: 'Ambrosio' },
          { id: '03', nombre: 'Germán Ríos Linares' },
          { id: '04', nombre: 'Jorge Hernández' },
          { id: '05', nombre: 'La Pica' },
          { id: '06', nombre: 'Pueblo Nuevo' },
          { id: '07', nombre: 'Rómulo Gallegos' },
          { id: '08', nombre: 'Rosario de Perijá' },
          { id: '09', nombre: 'San Benito' },
          { id: '10', nombre: 'Santa Lucía' }
        ]
      },
      {
        id: '04',
        nombre: 'Machiques',
        parroquias: [
          { id: '01', nombre: 'Machiques' },
          { id: '02', nombre: 'Libertad' },
          { id: '03', nombre: 'San José de Perijá' }
        ]
      },
      {
        id: '05',
        nombre: 'Mara',
        parroquias: [
          { id: '01', nombre: 'Mara' },
          { id: '02', nombre: 'Cañada de Urdaneta' },
          { id: '03', nombre: 'Luis de Vicente' }
        ]
      }
    ]
  },
  {
    id: 'AM',
    nombre: 'Amazonas',
    municipios: [
      {
        id: '01',
        nombre: 'Atabapo',
        parroquias: [
          { id: '01', nombre: 'Atabapo' },
          { id: '02', nombre: 'Ueheto' },
          { id: '03', nombre: 'Caname' }
        ]
      },
      {
        id: '02',
        nombre: 'Autana',
        parroquias: [
          { id: '01', nombre: 'Puerto Ayacucho' },
          { id: '02', nombre: 'Saimadoyi' },
          { id: '03', nombre: 'Boca de Autana' }
        ]
      },
      {
        id: '03',
        nombre: 'Manapiare',
        parroquias: [
          { id: '01', nombre: 'Manapiare' },
          { id: '02', nombre: 'Ventana' },
          { id: '03', nombre: 'San Juan de Manapiare' }
        ]
      },
      {
        id: '04',
        nombre: 'Maroa',
        parroquias: [
          { id: '01', nombre: 'Maroa' },
          { id: '02', nombre: 'Victorino' },
          { id: '03', nombre: 'Comunidad' }
        ]
      },
      {
        id: '05',
        nombre: 'Río Negro',
        parroquias: [
          { id: '01', nombre: 'San Carlos de Río Negro' },
          { id: '02', nombre: 'Cocuy' },
          { id: '03', nombre: 'Solano' }
        ]
      },
      {
        id: '06',
        nombre: 'Alto Orinoco',
        parroquias: [
          { id: '01', nombre: 'La Esmeralda' },
          { id: '02', nombre: 'Huachamacare' },
          { id: '03', nombre: 'Mavaca' }
        ]
      },
      {
        id: '07',
        nombre: 'Atures',
        parroquias: [
          { id: '01', nombre: 'Puerto Ayacucho' },
          { id: '02', nombre: 'Limoncita' },
          { id: '03', nombre: 'Platanal' }
        ]
      }
    ]
  },
  {
    id: 'AP',
    nombre: 'Apure',
    municipios: [
      {
        id: '01',
        nombre: 'San Fernando de Apure',
        parroquias: [
          { id: '01', nombre: 'San Fernando de Apure' },
          { id: '02', nombre: 'El Recreo' },
          { id: '03', nombre: 'Peñalver' }
        ]
      },
      {
        id: '02',
        nombre: 'Achaguas',
        parroquias: [
          { id: '01', nombre: 'Achaguas' },
          { id: '02', nombre: 'El Yagual' },
          { id: '03', nombre: 'Guasdualito' }
        ]
      },
      {
        id: '03',
        nombre: 'Biruaca',
        parroquias: [
          { id: '01', nombre: 'Biruaca' },
          { id: '02', nombre: 'Palmarito' }
        ]
      },
      {
        id: '04',
        nombre: 'Muñoz',
        parroquias: [
          { id: '01', nombre: 'Bruzual' },
          { id: '02', nombre: 'Mucuritas' },
          { id: '03', nombre: 'Páez' }
        ]
      },
      {
        id: '05',
        nombre: 'Páez',
        parroquias: [
          { id: '01', nombre: 'Guasdualito' },
          { id: '02', nombre: 'El Amparo' },
          { id: '03', nombre: 'San Camilo' }
        ]
      },
      {
        id: '06',
        nombre: 'Pedro Camejo',
        parroquias: [
          { id: '01', nombre: 'San Juan de Payara' },
          { id: '02', nombre: 'Cunaviche' },
          { id: '03', nombre: 'El Rastro' }
        ]
      },
      {
        id: '07',
        nombre: 'Rómulo Gallegos',
        parroquias: [
          { id: '01', nombre: 'Elorza' },
          { id: '02', nombre: 'La Trinidad' },
          { id: '03', nombre: 'Mesa de San Juan' }
        ]
      }
    ]
  },
  {
    id: 'AR',
    nombre: 'Aragua',
    municipios: [
      {
        id: '01',
        nombre: 'Girardot',
        parroquias: [
          { id: '01', nombre: 'Maracay' },
          { id: '02', nombre: 'Choroní' },
          { id: '03', nombre: 'El Limón' },
          { id: '04', nombre: 'La Victoria' },
          { id: '05', nombre: 'San Casimiro' },
          { id: '06', nombre: 'San Mateo' },
          { id: '07', nombre: 'Santa Rita' }
        ]
      },
      {
        id: '02',
        nombre: 'Bolívar',
        parroquias: [
          { id: '01', nombre: 'Bolívar' },
          { id: '02', nombre: 'San José' },
          { id: '03', nombre: 'San Mateo' }
        ]
      },
      {
        id: '03',
        nombre: 'Camatagua',
        parroquias: [
          { id: '01', nombre: 'Camatagua' },
          { id: '02', nombre: 'Carmen de Cura' },
          { id: '03', nombre: 'Mapuey' }
        ]
      },
      {
        id: '04',
        nombre: 'Francisco Linares Alcántara',
        parroquias: [
          { id: '01', nombre: 'Santa Rita' },
          { id: '02', nombre: 'Francisco de Miranda' },
          { id: '03', nombre: 'Monseñor Felipe' }
        ]
      },
      {
        id: '05',
        nombre: 'José Ángel Lamas',
        parroquias: [
          { id: '01', nombre: 'Santa Cruz' },
          { id: '02', nombre: 'José Rafael Revenga' },
          { id: '03', nombre: 'Castor Nieves' }
        ]
      },
      {
        id: '06',
        nombre: 'José Félix Ribas',
        parroquias: [
          { id: '01', nombre: 'La Victoria' },
          { id: '02', nombre: 'Cagua' },
          { id: '03', nombre: 'San Mateo' }
        ]
      },
      {
        id: '07',
        nombre: 'Libertador',
        parroquias: [
          { id: '01', nombre: 'Palo Negro' },
          { id: '02', nombre: 'Turmero' },
          { id: '03', nombre: 'El Consejo' }
        ]
      },
      {
        id: '08',
        nombre: 'Mario Briceño Iragorry',
        parroquias: [
          { id: '01', nombre: 'El Limón' },
          { id: '02', nombre: 'Caña de Azúcar' },
          { id: '03', nombre: 'Santa Cruz' }
        ]
      },
      {
        id: '09',
        nombre: 'Ocumare de la Costa',
        parroquias: [
          { id: '01', nombre: 'Ocumare de la Costa' },
          { id: '02', nombre: 'Cata' },
          { id: '03', nombre: 'Cuyagua' }
        ]
      },
      {
        id: '10',
        nombre: 'San Casimiro',
        parroquias: [
          { id: '01', nombre: 'San Casimiro' },
          { id: '02', nombre: 'Güiripa' },
          { id: '03', nombre: 'Ollas de Caramacate' }
        ]
      },
      {
        id: '11',
        nombre: 'San Sebastián',
        parroquias: [
          { id: '01', nombre: 'San Sebastián' },
          { id: '02', nombre: 'El Carmen' },
          { id: '03', nombre: 'Santa Cruz' }
        ]
      },
      {
        id: '12',
        nombre: 'Santiago Mariño',
        parroquias: [
          { id: '01', nombre: 'Turmero' },
          { id: '02', nombre: 'Arevalo' },
          { id: '03', nombre: 'Chuao' }
        ]
      },
      {
        id: '13',
        nombre: 'Santos Michelena',
        parroquias: [
          { id: '01', nombre: 'Las Tejerías' },
          { id: '02', nombre: 'Tiara' },
          { id: '03', nombre: 'Taguay' }
        ]
      },
      {
        id: '14',
        nombre: 'Sucre',
        parroquias: [
          { id: '01', nombre: 'Cagua' },
          { id: '02', nombre: 'Santa Cruz' },
          { id: '03', nombre: 'Turmero' }
        ]
      },
      {
        id: '15',
        nombre: 'Tovar',
        parroquias: [
          { id: '01', nombre: 'Tovar' },
          { id: '02', nombre: 'Colonia Tovar' },
          { id: '03', nombre: 'La Victoria' }
        ]
      },
      {
        id: '16',
        nombre: 'Urdaneta',
        parroquias: [
          { id: '01', nombre: 'Barbacoas' },
          { id: '02', nombre: 'Francisco de Miranda' },
          { id: '03', nombre: 'Las Peñitas' }
        ]
      },
      {
        id: '17',
        nombre: 'Zamora',
        parroquias: [
          { id: '01', nombre: 'Villa de Cura' },
          { id: '02', nombre: 'Magdaleno' },
          { id: '03', nombre: 'San Francisco' }
        ]
      },
      {
        id: '18',
        nombre: 'Zaraza',
        parroquias: [
          { id: '01', nombre: 'Zaraza' },
          { id: '02', nombre: 'San José' },
          { id: '03', nombre: 'Santa Bárbara' }
        ]
      }
    ]
  },
  {
    id: 'DF',
    nombre: 'Dependencias Federales',
    municipios: [
      {
        id: '01',
        nombre: 'Archipiélago de Los Roques',
        parroquias: [
          { id: '01', nombre: 'Gran Roque' },
          { id: '02', nombre: 'Norte' },
          { id: '03', nombre: 'Sur' }
        ]
      },
      {
        id: '02',
        nombre: 'Isla de Aves',
        parroquias: [
          { id: '01', nombre: 'Isla de Aves' }
        ]
      },
      {
        id: '03',
        nombre: 'Isla La Orchila',
        parroquias: [
          { id: '01', nombre: 'La Orchila' }
        ]
      },
      {
        id: '04',
        nombre: 'Isla La Sola',
        parroquias: [
          { id: '01', nombre: 'La Sola' }
        ]
      },
      {
        id: '05',
        nombre: 'Archipiélago de Las Aves',
        parroquias: [
          { id: '01', nombre: 'Las Aves' },
          { id: '02', nombre: 'Norte' },
          { id: '03', nombre: 'Sur' }
        ]
      },
      {
        id: '06',
        nombre: 'Archipiélago de Los Hermanos',
        parroquias: [
          { id: '01', nombre: 'Los Hermanos' },
          { id: '02', nombre: 'Grande' },
          { id: '03', nombre: 'Chica' }
        ]
      },
      {
        id: '07',
        nombre: 'Archipiélago de La Tortuga',
        parroquias: [
          { id: '01', nombre: 'La Tortuga' },
          { id: '02', nombre: 'Cayos' }
        ]
      }
    ]
  },
  {
    id: 'MI',
    nombre: 'Miranda',
    municipios: [
      {
        id: '01',
        nombre: 'Caracas',
        parroquias: [
          { id: '01', nombre: 'Libertador' },
          { id: '02', nombre: 'Bolívar' },
          { id: '03', nombre: 'Sucre' },
          { id: '04', nombre: 'Baruta' },
          { id: '05', nombre: 'El Hatillo' },
          { id: '06', nombre: 'Chacao' },
          { id: '07', nombre: 'Altamira' },
          { id: '08', nombre: 'La Florida' },
          { id: '09', nombre: 'Petare' },
          { id: '10', nombre: 'Caucaguita' },
          { id: '11', nombre: 'El Valle' },
          { id: '12', nombre: 'Santa Rosa' }
        ]
      },
      {
        id: '02',
        nombre: 'Acevedo',
        parroquias: [
          { id: '01', nombre: 'Caucagüita' },
          { id: '02', nombre: 'Filas de Mariches' },
          { id: '03', nombre: 'Santa Lucia del Tuy' }
        ]
      },
      {
        id: '03',
        nombre: 'Baruta',
        parroquias: [
          { id: '01', nombre: 'Baruta' },
          { id: '02', nombre: 'El Cafetal' },
          { id: '03', nombre: 'Las Mercedes' }
        ]
      },
      {
        id: '04',
        nombre: 'Brión',
        parroquias: [
          { id: '01', nombre: 'Higuerote' },
          { id: '02', nombre: 'Los Tacata' },
          { id: '03', nombre: 'Curiepe' }
        ]
      },
      {
        id: '05',
        nombre: 'Buroz',
        parroquias: [
          { id: '01', nombre: 'Mamporal' },
          { id: '02', nombre: 'El Jabil' },
          { id: '03', nombre: 'Tácata' }
        ]
      },
      {
        id: '06',
        nombre: 'Carrizal',
        parroquias: [
          { id: '01', nombre: 'Carrizal' },
          { id: '02', nombre: 'El Hatillo' },
          { id: '03', nombre: 'La Dolorita' }
        ]
      },
      {
        id: '07',
        nombre: 'Chacao',
        parroquias: [
          { id: '01', nombre: 'Chacao' },
          { id: '02', nombre: 'Altamira' },
          { id: '03', nombre: 'Los Palos Grandes' }
        ]
      },
      {
        id: '08',
        nombre: 'Cristóbal Rojas',
        parroquias: [
          { id: '01', nombre: 'Charallave' },
          { id: '02', nombre: 'Las Brisas' },
          { id: '03', nombre: 'Ocumare del Tuy' }
        ]
      },
      {
        id: '09',
        nombre: 'El Hatillo',
        parroquias: [
          { id: '01', nombre: 'El Hatillo' },
          { id: '02', nombre: 'La Lagunita' },
          { id: '03', nombre: 'El Lago' }
        ]
      },
      {
        id: '10',
        nombre: 'Guaicaipuro',
        parroquias: [
          { id: '01', nombre: 'Los Teques' },
          { id: '02', nombre: 'San Pedro' },
          { id: '03', nombre: 'Tácata' }
        ]
      },
      {
        id: '11',
        nombre: 'Independencia',
        parroquias: [
          { id: '01', nombre: 'Santa Teresa del Tuy' },
          { id: '02', nombre: 'El Cartanal' },
          { id: '03', nombre: 'Ocumare del Tuy' }
        ]
      },
      {
        id: '12',
        nombre: 'Lander',
        parroquias: [
          { id: '01', nombre: 'Ocumare del Tuy' },
          { id: '02', nombre: 'La Dolorita' },
          { id: '03', nombre: 'Santa Cruz' }
        ]
      },
      {
        id: '13',
        nombre: 'Los Salias',
        parroquias: [
          { id: '01', nombre: 'San Antonio de Los Altos' },
          { id: '02', nombre: 'Los Salias' },
          { id: '03', nombre: 'Colonia Tovar' }
        ]
      },
      {
        id: '14',
        nombre: 'Páez',
        parroquias: [
          { id: '01', nombre: 'Río Chico' },
          { id: '02', nombre: 'El Guapo' },
          { id: '03', nombre: 'Paparo' }
        ]
      },
      {
        id: '15',
        nombre: 'Paz Castillo',
        parroquias: [
          { id: '01', nombre: 'Santa Lucía' },
          { id: '02', nombre: 'El Hatillo' },
          { id: '03', nombre: 'La Dolorita' }
        ]
      },
      {
        id: '16',
        nombre: 'Pedro Gual',
        parroquias: [
          { id: '01', nombre: 'Cúpira' },
          { id: '02', nombre: 'Mamporal' },
          { id: '03', nombre: 'El Jabil' }
        ]
      },
      {
        id: '17',
        nombre: 'Plaza',
        parroquias: [
          { id: '01', nombre: 'Guarenas' },
          { id: '02', nombre: 'Guatire' },
          { id: '03', nombre: 'Palo Negro' }
        ]
      },
      {
        id: '18',
        nombre: 'Simón Bolívar',
        parroquias: [
          { id: '01', nombre: 'San Francisco de Yare' },
          { id: '02', nombre: 'San Antonio de Yare' },
          { id: '03', nombre: 'Ocumare del Tuy' }
        ]
      },
      {
        id: '19',
        nombre: 'Sucre',
        parroquias: [
          { id: '01', nombre: 'Petare' },
          { id: '02', nombre: 'La Dolorita' },
          { id: '03', nombre: 'El Hatillo' }
        ]
      },
      {
        id: '20',
        nombre: 'Urdaneta',
        parroquias: [
          { id: '01', nombre: 'Cúa' },
          { id: '02', nombre: 'Nueva Cúa' },
          { id: '03', nombre: 'Urdaneta' }
        ]
      },
      {
        id: '21',
        nombre: 'Zamora',
        parroquias: [
          { id: '01', nombre: 'Guatire' },
          { id: '02', nombre: 'Bolívar' },
          { id: '03', nombre: 'Santa Cruz' }
        ]
      }
    ]
  },
  {
    id: 'VA',
    nombre: 'Vargas',
    municipios: [
      {
        id: '01',
        nombre: 'Vargas',
        parroquias: [
          { id: '01', nombre: 'La Guaira' },
          { id: '02', nombre: 'Macuto' },
          { id: '03', nombre: 'Caraballeda' },
          { id: '04', nombre: 'Catia La Mar' },
          { id: '05', nombre: 'Carayaca' },
          { id: '06', nombre: 'Naiguatá' },
          { id: '07', nombre: 'Maiquetía' },
          { id: '08', nombre: 'Anare' },
          { id: '09', nombre: 'Los Caracas' },
          { id: '10', nombre: 'La Sabana' },
          { id: '11', nombre: 'Ocumare de la Costa' }
        ]
      }
    ]
  }
];

// Funciones de ayuda para obtener los datos
export const getEstados = () => VENEZUELA_DATA;

export const getMunicipiosByEstado = (estadoId: string): Municipio[] => {
  const estado = VENEZUELA_DATA.find(e => e.id === estadoId);
  return estado ? estado.municipios : [];
};

export const getParroquiasByMunicipio = (estadoId: string, municipioId: string): Parroquia[] => {
  const estado = VENEZUELA_DATA.find(e => e.id === estadoId);
  if (!estado) return [];
  
  const municipio = estado.municipios.find(m => m.id === municipioId);
  return municipio ? municipio.parroquias : [];
};

// Funciones para obtener nombres completos en lugar de códigos
export const getEstadoNombre = (estadoId: string): string => {
  const estado = VENEZUELA_DATA.find(e => e.id === estadoId);
  return estado ? estado.nombre : estadoId;
};

export const getMunicipioNombre = (estadoId: string, municipioId: string): string => {
  const estado = VENEZUELA_DATA.find(e => e.id === estadoId);
  if (!estado) return municipioId;
  
  const municipio = estado.municipios.find(m => m.id === municipioId);
  return municipio ? municipio.nombre : municipioId;
};

export const getParroquiaNombre = (estadoId: string, municipioId: string, parroquiaId: string): string => {
  const estado = VENEZUELA_DATA.find(e => e.id === estadoId);
  if (!estado) return parroquiaId;
  
  const municipio = estado.municipios.find(m => m.id === municipioId);
  if (!municipio) return parroquiaId;
  
  const parroquia = municipio.parroquias.find(p => p.id === parroquiaId);
  return parroquia ? parroquia.nombre : parroquiaId;
};

// Función para obtener la ubicación completa formateada
export const getUbicacionCompleta = (estadoId: string, municipioId: string, parroquiaId?: string): string => {
  const estadoNombre = getEstadoNombre(estadoId);
  const municipioNombre = getMunicipioNombre(estadoId, municipioId);
  
  if (parroquiaId) {
    const parroquiaNombre = getParroquiaNombre(estadoId, municipioId, parroquiaId);
    return `${estadoNombre}, ${municipioNombre}, ${parroquiaNombre}`;
  }
  
  return `${estadoNombre}, ${municipioNombre}`;
};
