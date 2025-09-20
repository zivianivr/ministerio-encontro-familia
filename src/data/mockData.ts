import { Casal, Equipe } from "@/types/ecc";

export const mockCasais: Casal[] = [
  {
    id: "1",
    numeroInscricao: 1,
    nomeEle: "Vando José de Amorim",
    religiaoEle: "Católico",
    contatoEle: "999051789",
    nomeEla: "Elizangela Silva de S. Amorim",
    religiaoEla: "Católica",
    contatoEla: "999861218",
    paroquia: "Santo Antônio",
    comunidade: "Santa Rita de Cassia",
    bairro: "Santa Rita do Zarur",
    endereco: "Rua Cruzeiro nº 95",
    eccPrimeiraEtapa: "VII",
    dataEcc: "22/09/2022",
    localEcc: "Ciep Gloria Roussin",
    criadoEm: new Date("2022-09-22"),
    atualizadoEm: new Date("2024-01-15")
  },
  {
    id: "2",
    numeroInscricao: 7,
    nomeEle: "Ruan Fernandes Freitas",
    religiaoEle: "Católico",
    contatoEle: "999243355",
    nomeEla: "Flavia Chicarino Gioserfi Fernandes",
    religiaoEla: "Católica",
    contatoEla: "999244100",
    paroquia: "Santo Antônio",
    comunidade: "Santa Cruz",
    bairro: "Santa Cruz",
    endereco: "Av. Capitão Franblime Carvalho nº 438",
    eccPrimeiraEtapa: "VII",
    dataEcc: "21/10/2022",
    localEcc: "Ciep Gloria Roussin",
    criadoEm: new Date("2022-10-21"),
    atualizadoEm: new Date("2024-01-15")
  },
  {
    id: "3",
    numeroInscricao: 15,
    nomeEle: "Bruno",
    religiaoEle: "Católico",
    contatoEle: "999123456",
    nomeEla: "Kelly",
    religiaoEla: "Católica",
    contatoEla: "999654321",
    paroquia: "Santo Antônio",
    comunidade: "Santa Rita de Cassia",
    bairro: "Centro",
    endereco: "Rua Principal nº 123",
    eccPrimeiraEtapa: "VI",
    dataEcc: "15/08/2021",
    localEcc: "Colégio João 23",
    criadoEm: new Date("2021-08-15"),
    atualizadoEm: new Date("2024-01-15")
  },
  {
    id: "4",
    numeroInscricao: 186,
    nomeEle: "Rogério",
    religiaoEle: "Católico",
    contatoEle: "999789456",
    nomeEla: "Edna",
    religiaoEla: "Católica",
    contatoEla: "999456789",
    paroquia: "São Sebastião",
    comunidade: "Nossa Senhora do Amparo",
    bairro: "Amparo",
    endereco: "Av. Nossa Senhora do Amparo nº 1000",
    eccPrimeiraEtapa: "V",
    dataEcc: "10/05/2020",
    localEcc: "Igreja São Sebastião",
    criadoEm: new Date("2020-05-10"),
    atualizadoEm: new Date("2024-01-15")
  },
  {
    id: "5",
    numeroInscricao: 208,
    nomeEle: "Marcelo",
    religiaoEle: "Católico",
    contatoEle: "999321654",
    nomeEla: "Tamires",
    religiaoEla: "Católica",
    contatoEla: "999987654",
    paroquia: "Santo Antônio",
    comunidade: "Santa Cruz",
    bairro: "Santa Cruz",
    endereco: "Rua da Igreja nº 50",
    eccPrimeiraEtapa: "VII",
    dataEcc: "21/10/2022",
    localEcc: "Ciep Gloria Roussin",
    criadoEm: new Date("2022-10-21"),
    atualizadoEm: new Date("2024-01-15")
  },
];

export const mockEquipes: Equipe[] = [
  {
    id: "coordenacao",
    nome: "Coordenação Geral",
    coordenador: {
      casal: mockCasais[4], // Marcelo e Tamires
      numeroInscricao: 208
    },
    casais: [],
    descricao: "Coordenação geral do encontro"
  },
  {
    id: "sala",
    nome: "Equipe de Sala",
    coordenador: {
      casal: mockCasais[2], // Bruno e Kelly
      numeroInscricao: 15
    },
    casais: [
      { casal: mockCasais[4], numeroInscricao: 208 }
    ],
    descricao: "Responsável pela organização das salas"
  },
  {
    id: "cafezinho",
    nome: "Cafezinho e Mini Mercado",
    coordenador: {
      casal: mockCasais[3], // Rogério e Edna
      numeroInscricao: 186
    },
    casais: [
      { casal: mockCasais[0], numeroInscricao: 1 },
    ],
    descricao: "Responsável pelo cafezinho e mini mercado"
  },
  {
    id: "ordem",
    nome: "Equipe de Ordem",
    coordenador: {
      casal: mockCasais[1], // Ruan e Flavia
      numeroInscricao: 7
    },
    casais: [],
    descricao: "Manutenção da ordem durante o encontro"
  }
];