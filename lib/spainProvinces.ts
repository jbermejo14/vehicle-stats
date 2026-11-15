export interface ProvinceMeta {
  code: string;
  name: string;
  shortName: string;
  community: string;
  population: number;
  center: [number, number]; // approx [x, y] in 800x600 SVG viewBox
  path: string; // SVG path
}

// Complete 52 Spanish provinces with real population data and responsive SVG coordinates
export const SPAIN_PROVINCES: Record<string, ProvinceMeta> = {
  "01": {
    code: "01",
    name: "Álava / Araba",
    shortName: "Álava",
    community: "País Vasco",
    population: 334412,
    center: [462, 115],
    path: "M 450,105 L 475,108 L 478,125 L 460,132 L 448,118 Z"
  },
  "02": {
    code: "02",
    name: "Albacete",
    shortName: "Albacete",
    community: "Castilla-La Mancha",
    population: 387735,
    center: [480, 345],
    path: "M 450,325 L 505,325 L 520,360 L 475,375 L 445,350 Z"
  },
  "03": {
    code: "03",
    name: "Alicante / Alacant",
    shortName: "Alicante",
    community: "Comunitat Valenciana",
    population: 1950357,
    center: [540, 360],
    path: "M 525,340 L 560,350 L 555,385 L 525,380 L 520,355 Z"
  },
  "04": {
    code: "04",
    name: "Almería",
    shortName: "Almería",
    community: "Andalucía",
    population: 753364,
    center: [465, 455],
    path: "M 445,435 L 485,440 L 490,475 L 445,475 L 440,445 Z"
  },
  "05": {
    code: "05",
    name: "Ávila",
    shortName: "Ávila",
    community: "Castilla y León",
    population: 159740,
    center: [330, 230],
    path: "M 315,210 L 350,215 L 355,250 L 320,255 L 310,225 Z"
  },
  "06": {
    code: "06",
    name: "Badajoz",
    shortName: "Badajoz",
    community: "Extremadura",
    population: 666971,
    center: [240, 350],
    path: "M 200,320 L 285,320 L 290,380 L 210,385 L 195,340 Z"
  },
  "07": {
    code: "07",
    name: "Illes Balears",
    shortName: "Baleares",
    community: "Illes Balears",
    population: 1223961,
    center: [700, 280],
    path: "M 675,255 L 725,250 L 735,285 L 685,295 Z M 645,310 L 665,305 L 668,325 L 648,328 Z M 735,220 L 755,225 L 750,240 L 730,235 Z"
  },
  "08": {
    code: "08",
    name: "Barcelona",
    shortName: "Barcelona",
    community: "Cataluña",
    population: 5805500,
    center: [685, 140],
    path: "M 660,120 L 705,125 L 710,165 L 670,165 L 655,140 Z"
  },
  "09": {
    code: "09",
    name: "Burgos",
    shortName: "Burgos",
    community: "Castilla y León",
    population: 357345,
    center: [405, 115],
    path: "M 385,85 L 435,90 L 430,155 L 385,150 L 380,105 Z"
  },
  "10": {
    code: "10",
    name: "Cáceres",
    shortName: "Cáceres",
    community: "Extremadura",
    population: 389558,
    center: [245, 270],
    path: "M 205,240 L 285,245 L 290,305 L 205,300 Z"
  },
  "11": {
    code: "11",
    name: "Cádiz",
    shortName: "Cádiz",
    community: "Andalucía",
    population: 1259339,
    center: [265, 485],
    path: "M 245,465 L 290,465 L 295,510 L 250,515 L 235,485 Z"
  },
  "12": {
    code: "12",
    name: "Castellón / Castelló",
    shortName: "Castellón",
    community: "Comunitat Valenciana",
    population: 604399,
    center: [575, 235],
    path: "M 555,210 L 595,220 L 600,265 L 565,270 L 550,230 Z"
  },
  "13": {
    code: "13",
    name: "Ciudad Real",
    shortName: "Ciudad Real",
    community: "Castilla-La Mancha",
    population: 491927,
    center: [380, 335],
    path: "M 335,310 L 435,310 L 430,370 L 330,365 Z"
  },
  "14": {
    code: "14",
    name: "Córdoba",
    shortName: "Córdoba",
    community: "Andalucía",
    population: 772464,
    center: [320, 400],
    path: "M 285,375 L 360,375 L 360,430 L 285,425 Z"
  },
  "15": {
    code: "15",
    name: "A Coruña",
    shortName: "A Coruña",
    community: "Galicia",
    population: 1123494,
    center: [140, 75],
    path: "M 115,45 L 175,50 L 165,115 L 115,105 L 105,70 Z"
  },
  "16": {
    code: "16",
    name: "Cuenca",
    shortName: "Cuenca",
    community: "Castilla-La Mancha",
    population: 198436,
    center: [475, 260],
    path: "M 440,230 L 520,235 L 525,295 L 435,290 Z"
  },
  "17": {
    code: "17",
    name: "Girona",
    shortName: "Girona",
    community: "Cataluña",
    population: 816694,
    center: [725, 95],
    path: "M 695,75 L 755,75 L 760,125 L 705,125 Z"
  },
  "18": {
    code: "18",
    name: "Granada",
    shortName: "Granada",
    community: "Andalucía",
    population: 934272,
    center: [400, 450],
    path: "M 370,425 L 440,425 L 435,480 L 365,475 Z"
  },
  "19": {
    code: "19",
    name: "Guadalajara",
    shortName: "Guadalajara",
    community: "Castilla-La Mancha",
    population: 275082,
    center: [440, 205],
    path: "M 410,180 L 475,185 L 470,240 L 410,235 Z"
  },
  "20": {
    code: "20",
    name: "Gipuzkoa",
    shortName: "Gipuzkoa",
    community: "País Vasco",
    population: 727409,
    center: [485, 90],
    path: "M 470,75 L 505,80 L 500,105 L 470,100 Z"
  },
  "21": {
    code: "21",
    name: "Huelva",
    shortName: "Huelva",
    community: "Andalucía",
    population: 533463,
    center: [195, 440],
    path: "M 170,410 L 225,410 L 225,475 L 175,470 Z"
  },
  "22": {
    code: "22",
    name: "Huesca",
    shortName: "Huesca",
    community: "Aragón",
    population: 226878,
    center: [570, 105],
    path: "M 535,70 L 610,75 L 605,145 L 535,140 Z"
  },
  "23": {
    code: "23",
    name: "Jaén",
    shortName: "Jaén",
    community: "Andalucía",
    population: 620242,
    center: [400, 395],
    path: "M 365,370 L 445,370 L 440,425 L 365,420 Z"
  },
  "24": {
    code: "24",
    name: "León",
    shortName: "León",
    community: "Castilla y León",
    population: 447182,
    center: [275, 105],
    path: "M 235,70 L 325,75 L 320,145 L 235,140 Z"
  },
  "25": {
    code: "25",
    name: "Lleida",
    shortName: "Lleida",
    community: "Cataluña",
    population: 447343,
    center: [640, 110],
    path: "M 610,75 L 675,80 L 665,150 L 605,145 Z"
  },
  "26": {
    code: "26",
    name: "La Rioja",
    shortName: "La Rioja",
    community: "La Rioja",
    population: 323609,
    center: [450, 135],
    path: "M 430,120 L 480,125 L 475,155 L 425,150 Z"
  },
  "27": {
    code: "27",
    name: "Lugo",
    shortName: "Lugo",
    community: "Galicia",
    population: 324267,
    center: [190, 80],
    path: "M 165,55 L 225,60 L 220,125 L 165,120 Z"
  },
  "28": {
    code: "28",
    name: "Madrid",
    shortName: "Madrid",
    community: "Comunidad de Madrid",
    population: 7000621,
    center: [375, 240],
    path: "M 350,215 L 405,220 L 400,270 L 355,265 Z"
  },
  "29": {
    code: "29",
    name: "Málaga",
    shortName: "Málaga",
    community: "Andalucía",
    population: 1752728,
    center: [330, 480],
    path: "M 300,460 L 370,460 L 365,505 L 295,500 Z"
  },
  "30": {
    code: "30",
    name: "Murcia",
    shortName: "Murcia",
    community: "Región de Murcia",
    population: 1551692,
    center: [495, 395],
    path: "M 470,375 L 530,375 L 525,425 L 465,425 Z"
  },
  "31": {
    code: "31",
    name: "Navarra",
    shortName: "Navarra",
    community: "Comunidad Foral de Navarra",
    population: 672155,
    center: [495, 115],
    path: "M 475,90 L 535,90 L 530,150 L 475,145 Z"
  },
  "32": {
    code: "32",
    name: "Ourense",
    shortName: "Ourense",
    community: "Galicia",
    population: 304295,
    center: [175, 140],
    path: "M 150,120 L 210,125 L 205,170 L 145,165 Z"
  },
  "33": {
    code: "33",
    name: "Asturias",
    shortName: "Asturias",
    community: "Principado de Asturias",
    population: 1006060,
    center: [275, 55],
    path: "M 235,40 L 330,45 L 325,75 L 230,70 Z"
  },
  "34": {
    code: "34",
    name: "Palencia",
    shortName: "Palencia",
    community: "Castilla y León",
    population: 157205,
    center: [350, 115],
    path: "M 330,85 L 375,85 L 370,155 L 325,150 Z"
  },
  "35": {
    code: "35",
    name: "Las Palmas",
    shortName: "Las Palmas",
    community: "Canarias",
    population: 1140258,
    center: [140, 545], // Inset coordinates
    path: "M 125,525 L 155,525 L 160,565 L 125,565 Z M 165,510 L 180,515 L 175,540 L 160,535 Z M 175,490 L 190,495 L 185,515 L 170,510 Z"
  },
  "36": {
    code: "36",
    name: "Pontevedra",
    shortName: "Pontevedra",
    community: "Galicia",
    population: 944275,
    center: [125, 130],
    path: "M 105,105 L 145,110 L 140,165 L 105,160 Z"
  },
  "37": {
    code: "37",
    name: "Salamanca",
    shortName: "Salamanca",
    community: "Castilla y León",
    population: 327338,
    center: [265, 205],
    path: "M 225,175 L 305,180 L 305,240 L 230,235 Z"
  },
  "38": {
    code: "38",
    name: "Santa Cruz de Tenerife",
    shortName: "S.C. Tenerife",
    community: "Canarias",
    population: 1058304,
    center: [80, 545], // Inset coordinates
    path: "M 65,525 L 105,525 L 110,555 L 70,555 Z M 40,545 L 55,545 L 50,565 L 35,565 Z M 35,520 L 50,520 L 45,535 L 30,535 Z"
  },
  "39": {
    code: "39",
    name: "Cantabria",
    shortName: "Cantabria",
    community: "Cantabria",
    population: 588387,
    center: [385, 60],
    path: "M 345,50 L 420,55 L 415,85 L 345,80 Z"
  },
  "40": {
    code: "40",
    name: "Segovia",
    shortName: "Segovia",
    community: "Castilla y León",
    population: 155332,
    center: [375, 185],
    path: "M 345,165 L 405,165 L 405,210 L 345,210 Z"
  },
  "41": {
    code: "41",
    name: "Sevilla",
    shortName: "Sevilla",
    community: "Andalucía",
    population: 1960014,
    center: [255, 425],
    path: "M 220,395 L 295,395 L 290,460 L 220,455 Z"
  },
  "42": {
    code: "42",
    name: "Soria",
    shortName: "Soria",
    community: "Castilla y León",
    population: 89482,
    center: [465, 160],
    path: "M 435,140 L 495,140 L 495,190 L 435,185 Z"
  },
  "43": {
    code: "43",
    name: "Tarragona",
    shortName: "Tarragona",
    community: "Cataluña",
    population: 850986,
    center: [635, 185],
    path: "M 605,160 L 665,160 L 660,215 L 600,210 Z"
  },
  "44": {
    code: "44",
    name: "Teruel",
    shortName: "Teruel",
    community: "Aragón",
    population: 135046,
    center: [520, 220],
    path: "M 490,185 L 560,190 L 555,260 L 485,255 Z"
  },
  "45": {
    code: "45",
    name: "Toledo",
    shortName: "Toledo",
    community: "Castilla-La Mancha",
    population: 735150,
    center: [350, 285],
    path: "M 305,260 L 405,265 L 400,315 L 305,310 Z"
  },
  "46": {
    code: "46",
    name: "Valencia / València",
    shortName: "Valencia",
    community: "Comunitat Valenciana",
    population: 2630000,
    center: [545, 305],
    path: "M 520,270 L 580,275 L 575,340 L 520,335 Z"
  },
  "47": {
    code: "47",
    name: "Valladolid",
    shortName: "Valladolid",
    community: "Castilla y León",
    population: 521333,
    center: [335, 160],
    path: "M 305,135 L 365,140 L 360,190 L 305,185 Z"
  },
  "48": {
    code: "48",
    name: "Bizkaia",
    shortName: "Bizkaia",
    community: "País Vasco",
    population: 1153285,
    center: [445, 80],
    path: "M 425,65 L 465,65 L 465,95 L 425,95 Z"
  },
  "49": {
    code: "49",
    name: "Zamora",
    shortName: "Zamora",
    community: "Castilla y León",
    population: 166200,
    center: [270, 155],
    path: "M 235,130 L 305,135 L 300,185 L 235,180 Z"
  },
  "50": {
    code: "50",
    name: "Zaragoza",
    shortName: "Zaragoza",
    community: "Aragón",
    population: 967452,
    center: [525, 165],
    path: "M 490,135 L 570,140 L 565,200 L 485,195 Z"
  },
  "51": {
    code: "51",
    name: "Ceuta",
    shortName: "Ceuta",
    community: "Ceuta",
    population: 83039,
    center: [285, 545],
    path: "M 280,540 L 295,540 L 295,552 L 280,552 Z"
  },
  "52": {
    code: "52",
    name: "Melilla",
    shortName: "Melilla",
    community: "Melilla",
    population: 85491,
    center: [425, 545],
    path: "M 420,540 L 435,540 L 435,552 L 420,552 Z"
  }
};

export function getProvinceByCode(code: string): ProvinceMeta | undefined {
  const cleanCode = code.padStart(2, '0');
  return SPAIN_PROVINCES[cleanCode];
}

export function getProvinceByPostalCode(cp: string): ProvinceMeta | undefined {
  if (!cp || cp.length < 2) return undefined;
  const provCode = cp.substring(0, 2);
  return getProvinceByCode(provCode);
}
